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
 * Four commands, and they exist because a database can be in three different situations:
 *
 *   node src/db/migrate.js status      what has run, what has not
 *   node src/db/migrate.js up          apply everything pending, in filename order
 *   node src/db/migrate.js mark <file> record one as applied without running it
 *   node src/db/migrate.js baseline    record every file present, running none
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

/** Applying one file. A `.sql` is handed to MySQL whole; a `.js` exports a function and is given the
 *  connection, which is the case DATA 07 needs — decoding a url is not something MySQL can do, so
 *  that migration has to be a script and not a statement. */
const applyMigration = async (conn, file) => {
  const full = path.join(MIGRATIONS_DIR, file);

  if (path.extname(file) === ".js") {
    const migration = require(full);
    if (typeof migration !== "function") {
      throw new Error(`${file} must export a function taking a connection`);
    }
    await migration(conn);
    return;
  }

  await conn.query(fs.readFileSync(full, "utf8"));
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
