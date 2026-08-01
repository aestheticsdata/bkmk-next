const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

/* The migration runner (COS-332).
 *
 * `migrations/` held one file, then two, and nothing anywhere said which of them had run on which
 * database — the tracking was a markdown table updated by hand, and `bkmk.sql` is a creation script
 * rather than a picture of the schema in production. Three of the tickets queued behind this one
 * want a migration each; the answer to "what is actually true over there" cannot keep being an SSH
 * session and a `SHOW CREATE TABLE`.
 *
 * Five commands. Four of them exist because a database can be in three different situations:
 *
 *   node src/db/migrate.js status         what has run, what has not
 *   node src/db/migrate.js up             apply everything pending, in filename order
 *   node src/db/migrate.js mark <file>    record one as applied without running it
 *   node src/db/migrate.js baseline       record every file present, running none
 *   node src/db/migrate.js dry-run <file> what a `.js` migration would write, without writing it
 *
 * `mark` is for a database where a migration was applied by hand — dev, for the two that predate
 * this runner. `baseline` is for a database just created from `bkmk.sql`, which already carries
 * every change those files describe: running them there would fail on a duplicate column, and
 * skipping the bookkeeping would make the next `up` try anyway. Production is the third case and the
 * simple one — it has neither, so `up` applies both.
 *
 * ⚠️ **The runner owns its connection.** `dbinitmysql` opens one per HTTP request and closes it, and
 * it deliberately does not set `multipleStatements` — a migration file is several statements, and
 * turning that flag on for the request path would widen every injection that ever gets through. So
 * the connection is built here, with that flag, and closed when the run ends.
 *
 * ⚠️ **No transaction around a migration, because MySQL cannot give one.** DDL commits implicitly:
 * an `ALTER TABLE` inside a transaction ends it. Wrapping the run would produce a promise the
 * database does not keep. What the runner does instead is stop at the first failure and record
 * nothing for it, so `status` shows exactly how far it got and the file itself says what it does.
 *
 * ⚠️ **It is not called at boot.** `server.js` starts under pm2 with `watch: true` in dev; a runner
 * on that path would apply a schema change on a file save. Migrating is a deploy step, and the
 * README says where it goes.
 *
 * ⚠️ **`dry-run` is the fifth, and it is opt-in per file** (COS-334). DATA 07 rewrites the text of
 * every row it touches, and a rewrite of 1 177 values wants to be read before it is run. So a `.js`
 * migration is handed `{ dryRun }` and can print what it would write instead of writing it — but only
 * if it has said it knows how, by setting `dryRun` on the function it exports. A migration that
 * ignores the option would apply itself in full, and a dry run that is a full apply with a
 * reassuring word in front of it is worse than not having one. Nothing is recorded either way: a
 * previewed migration is still pending.
 */

const MIGRATIONS_DIR = path.join(__dirname, "migrations");
const TABLE = "schema_migrations";
const EXTENSIONS = [".sql", ".js"];

/* The connection settings.
 *
 * `process.env` first, which is what pm2 hands the server. A runner invoked from a shell has none of
 * it, though — bkmk's environment lives in `ecosystem.config.js`, untracked, which is also what
 * `server.js` tells you when `SESSION_SECRET` is missing. So the file is read as a fallback, and the
 * environment is picked by `NODE_ENV`, defaulting to dev: a runner that reaches for production
 * because a variable was unset is not a mistake worth making once. */
const readConnectionSettings = () => {
  const { HOST, DB_USER, DB_PASSWORD, DB } = process.env;
  if (HOST && DB_USER && DB) {
    return { host: HOST, user: DB_USER, password: DB_PASSWORD, database: DB };
  }

  const configPath = path.join(__dirname, "..", "..", "ecosystem.config.js");
  if (!fs.existsSync(configPath)) {
    throw new Error(`no database settings: set HOST/DB_USER/DB_PASSWORD/DB, or add ${configPath}`);
  }

  const wanted = process.env.NODE_ENV === "production" ? "env_production" : "env_dev";
  const app = require(configPath).apps?.find((candidate) => candidate[wanted]?.DB);
  const env = app?.[wanted];
  if (!env) {
    throw new Error(`no ${wanted} with a DB in ecosystem.config.js`);
  }

  return { host: env.HOST, user: env.DB_USER, password: env.DB_PASSWORD, database: env.DB };
};

const connect = async () => {
  const settings = readConnectionSettings();
  const connection = await mysql.createConnection({ ...settings, multipleStatements: true });
  return { connection, database: settings.database, host: settings.host };
};

/** Created on first use rather than by a migration, since it is what records that migrations ran.
 *  The filename is the key: two files can never share one, and it is the only identifier a
 *  migration has that survives being read out of the database. */
const ensureTable = (conn) =>
  conn.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      filename   VARCHAR(255) NOT NULL PRIMARY KEY,
      applied_at DATETIME NOT NULL
    )
  `);

/** Every migration on disk, in filename order — which is date order, because the names start with
 *  one. Anything else in the folder (the README) is ignored. */
const migrationFiles = () =>
  fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => EXTENSIONS.includes(path.extname(file)))
    .sort();

const appliedFiles = async (conn) => {
  const [rows] = await conn.query(`SELECT filename FROM ${TABLE}`);
  return new Set(rows.map((row) => row.filename));
};

const record = (conn, file) => conn.execute(`INSERT INTO ${TABLE} (filename, applied_at) VALUES (?, NOW())`, [file]);

/** The function a `.js` migration exports, loaded and checked. Separate from `applyMigration` because
 *  `dry-run` needs the same function and none of the `.sql` half. */
const loadJsMigration = (file) => {
  const migration = require(path.join(MIGRATIONS_DIR, file));
  if (typeof migration !== "function") {
    throw new Error(`${file} must export a function taking a connection`);
  }
  return migration;
};

/** Applying one file. A `.sql` is handed to MySQL whole; a `.js` exports a function and is given the
 *  connection, which is the case DATA 07 needs — decoding a url is not something MySQL can do, so
 *  that migration has to be a script and not a statement.
 *
 *  The options object is the second argument every `.js` migration is handed. `up` passes
 *  `dryRun: false` explicitly rather than nothing, so that a migration reading the flag sees the same
 *  shape whichever command called it. */
const applyMigration = async (conn, file, options = { dryRun: false }) => {
  if (path.extname(file) === ".js") {
    await loadJsMigration(file)(conn, options);
    return;
  }

  await conn.query(fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8"));
};

const commands = {
  async status(conn) {
    const applied = await appliedFiles(conn);
    const files = migrationFiles();

    for (const file of files) {
      console.log(`${applied.has(file) ? "applied" : "pending"}  ${file}`);
    }

    // A row with no file behind it: a migration deleted from the repo, or the wrong database.
    for (const file of applied) {
      if (!files.includes(file)) console.log(`unknown  ${file} (recorded, but not in migrations/)`);
    }
  },

  async up(conn) {
    const applied = await appliedFiles(conn);
    const pending = migrationFiles().filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log("nothing to apply");
      return;
    }

    for (const file of pending) {
      process.stdout.write(`applying ${file} … `);
      await applyMigration(conn, file);
      await record(conn, file);
      console.log("ok");
    }
  },

  /* What a migration would write, without writing it and without recording anything.
   *
   * Three refusals, and each one is a way of not lying about what just happened: a file that is not
   * there, a `.sql` — MySQL has no preview and handing the statements over *is* running them — and a
   * `.js` that has not declared it can do this. The last is the one that matters: without it, "dry
   * run" over a migration that ignores its second argument applies the migration.
   *
   * A file already applied is previewed all the same, and says so. It is the natural way to ask
   * "would this find anything to do today", and the answer on a migration that has run is the empty
   * one it should be. */
  /* Hyphenated on purpose: the key *is* the command line word — the dispatch below looks the
   * argument up in this object, and the error it prints when it misses lists these keys. */
  async "dry-run"(conn, file) {
    if (!file) throw new Error("dry-run needs a filename");
    if (!migrationFiles().includes(file)) throw new Error(`${file} is not in migrations/`);
    if (path.extname(file) !== ".js") throw new Error(`${file} is a .sql — there is no preview of handing it to MySQL`);

    const migration = loadJsMigration(file);
    if (migration.dryRun !== true) {
      throw new Error(`${file} does not support a dry run — it would apply itself in full`);
    }

    if ((await appliedFiles(conn)).has(file)) {
      console.log(`${file} is already recorded as applied — previewing it anyway`);
    }

    await migration(conn, { dryRun: true });
    console.log("\nnothing was written, and nothing was recorded");
  },

  async mark(conn, file) {
    if (!file) throw new Error("mark needs a filename");
    if (!migrationFiles().includes(file)) throw new Error(`${file} is not in migrations/`);
    if ((await appliedFiles(conn)).has(file)) {
      console.log(`${file} is already recorded`);
      return;
    }

    await record(conn, file);
    console.log(`recorded ${file} as applied, without running it`);
  },

  async baseline(conn) {
    const applied = await appliedFiles(conn);
    const fresh = migrationFiles().filter((file) => !applied.has(file));

    for (const file of fresh) {
      await record(conn, file);
      console.log(`recorded ${file}`);
    }

    console.log(fresh.length === 0 ? "already baselined" : `${fresh.length} recorded, none run`);
  },
};

(async () => {
  const [command = "status", argument] = process.argv.slice(2);
  const run = commands[command];

  if (!run) {
    console.error(`unknown command "${command}" — one of ${Object.keys(commands).join(", ")}`);
    process.exit(1);
  }

  const { connection, database, host } = await connect();
  console.log(`${command} on ${database}@${host}`);

  try {
    await ensureTable(connection);
    await run(connection, argument);
  } finally {
    await connection.end();
  }
})().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
