/* pm2 for the front (COS-411). Same shape as `~/dev/pfa/front/ecosystem.config.cjs`.
 *
 * **This file is tracked, and the backend's is not.** `backend/ecosystem.config.js` carries the
 * database password and the session secret, so it is gitignored and lives only on the server.
 * The front has nothing to keep: the API is reached at the relative `/api` (see
 * `src/helpers/apiBase.ts`), so there is no origin to configure and no key to hold. A config with
 * no secrets in it belongs in the repository, where the deploy can read it.
 *
 * ⚠️ **The front is a node process now, not a folder of files.** Until this deploy, nginx served
 * `public_html` with `try_files` — Next 13 exported a static site. Next 16 App Router cannot:
 * `next.config.js` sets response headers and `auth/server/getServerSession.ts` reads the session
 * on the server, and neither survives an export. So `next start` runs here and nginx proxies to
 * it.
 *
 * `-H 127.0.0.1` keeps the process off the public interface — nginx is the only thing that should
 * reach 3100, and binding to 0.0.0.0 would publish the front on a second, unencrypted port. */
module.exports = {
  apps: [
    {
      name: "bkmk-front",
      cwd: __dirname,
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3100 -H 127.0.0.1",
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production",
        PORT: "3100",
        HOST: "127.0.0.1",
      },
    },
  ],
};
