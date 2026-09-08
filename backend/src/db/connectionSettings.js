const fs = require("node:fs");
const path = require("node:path");

/* The connection settings, for the scripts that run outside pm2 (COS-332, shared since BMK-72).
 *
 * `process.env` first, which is what pm2 hands the server. A script invoked from a shell has none of
 * it, though — bkmk's environment lives in `ecosystem.config.js`, untracked, which is also what
 * `server.js` tells you when `SESSION_SECRET` is missing. So the file is read as a fallback, and the
 * environment is picked by `NODE_ENV`, defaulting to dev: a script that reaches for production
 * because a variable was unset is not a mistake worth making once.
 *
 * It sat inside `migrate.js` until the seeder needed the same twenty lines; one copy, so the two
 * cannot disagree about which file and which environment a script reads. */
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

module.exports = { readConnectionSettings };
