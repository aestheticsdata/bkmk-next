#!/usr/bin/env node
/* The API, started from a shell rather than from pm2 (BMK-73).
 *
 * `pnpm video:generate` in `frontend/` starts the API itself when nothing answers on its port
 * (`webServer` in `playwright.demo.config.ts`), and Playwright needs a process that stays in the
 * foreground for as long as the server runs — `pm2 start` returns at once and hands the process to
 * its daemon, which is the shape Playwright reports as "exited before the url was available".
 *
 * So this is `pm2 start ecosystem.config.js --env dev` without the daemon: the `bkmk-server` app's
 * `env_dev` merged into the environment — a variable already set wins, which is what lets a shell
 * override `PORT` — then `src/server.js` required in place. The two pm2 options that ride along in
 * that block (`watch`, `ignore_watch`) are not variables and are skipped.
 *
 * `node scripts/dev-api.js` runs it on its own. It is not what production does: there, pm2 owns
 * the process. */
const path = require("node:path");

const configPath = path.join(__dirname, "..", "ecosystem.config.js");
const app = require(configPath).apps?.find((candidate) => candidate.name === "bkmk-server");
if (!app?.env_dev) {
  throw new Error(`no app named bkmk-server with an env_dev in ${configPath}`);
}

for (const [key, value] of Object.entries(app.env_dev)) {
  if (typeof value !== "string" && typeof value !== "number") continue;
  if (process.env[key] === undefined) process.env[key] = String(value);
}

require("../src/server.js");
