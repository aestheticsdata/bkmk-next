/**
 * The API entry point. Port of `~/dev/pfa/nest-api/src/main.ts`'s session setup (COS-293).
 *
 * The whole thing is wrapped in an async `bootstrap()` for one reason: the Redis client has
 * to be connected before the session store answers a request, and a CommonJS module has no
 * top-level await. Same shape as pfa's `main.ts`, minus Nest.
 *
 * `saveUninitialized: false` means a session is written only once a route puts something on
 * `req.session` — which, since COS-294, signing in does. A visitor who never signs in is
 * never given a cookie and never occupies a key in Redis.
 *
 * **The authentication and CSRF middlewares are not mounted here.** They sit at the top of
 * each protected router, the way pfa decorates each controller — see `routes/api/users.js`
 * for why the public routes must not inherit them.
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const OS = require("os");
const cronMysql = require("./cron/cron-mysql");
const redisService = require("./redisService");
const { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } = require("./auth/constants");

process.env.UV_THREADPOOL_SIZE = OS.cpus().length;

const bootstrap = async () => {
  if (!process.env.SESSION_SECRET) {
    // Not a stack trace from inside express-session: bkmk's environment lives in
    // `ecosystem.config.js`, which is untracked, so a fresh checkout has to be told where
    // the variable goes. pm2 also caches the environment across restarts — `pm2 restart
    // ecosystem.config.js --env dev` is what re-reads the file.
    throw new Error("SESSION_SECRET is missing — add it to ecosystem.config.js, then restart pm2 with --env dev");
  }

  await redisService.connect();

  const app = express();

  // The Kimsufi reverse proxy terminates HTTPS, so `req.secure` is false at this hop and a
  // `Secure` cookie would never be set. `trust proxy` makes Express read `X-Forwarded-Proto`
  // instead, and `proxy: true` below tells express-session to do the same.
  app.set("trust proxy", 1);

  app.use(helmet());

  // A single named origin with `credentials: true`, replacing the wide-open `cors()`. The
  // wildcard and credentialed requests are mutually exclusive per the CORS spec, so this is
  // what the session cookie costs. In production front and API share
  // `bkmk.1991computer.com` — the proxy maps `/api` — and this only really carries the dev
  // pair, where the front is on 3100 and the API on 3101.
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? "http://localhost:3100",
      credentials: true,
    }),
  );

  app.use(
    session({
      name: SESSION_COOKIE_NAME,
      store: new RedisStore({
        client: redisService.getClient(),
        prefix: redisService.SESSION_PREFIX,
        ttl: SESSION_TTL_SECONDS,
      }),
      secret: process.env.SESSION_SECRET,
      // Do not rewrite an untouched session on every request, and do not create one for a
      // visitor who never signs in — the second is also what keeps this ticket inert.
      resave: false,
      saveUninitialized: false,
      rolling: true,
      proxy: true,
      cookie: {
        httpOnly: true,
        // Secure in production only — a `Secure` cookie is dropped over plain HTTP, which
        // would break dev outright. `COOKIE_SECURE=false` is the escape hatch for a
        // production host without HTTPS.
        secure: process.env.COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production",
        // `lax` sends the cookie on top-level navigation but not on cross-site subrequests.
        // `strict` would break returning from an external link; `none` would need `Secure`
        // and hand the cookie to any site.
        sameSite: "lax",
        maxAge: SESSION_TTL_SECONDS * 1000,
      },
    }),
  );

  app.use(express.json());

  app.use("/users", require("./routes/api/users"));
  app.use("/bookmarks", require("./routes/api/bookmarks"));
  app.use("/categories", require("./routes/api/categories"));
  app.use("/reminders", require("./routes/api/reminders"));

  /* The error handler, finally mounted (COS-297) — last, because Express only routes an error
   * to a four-argument middleware declared after everything that can raise one.
   *
   * It was written long ago and never wired up, so every `next(createError(…))` fell through to
   * Express's default handler and answered an **HTML page**. On an API consumed by axios that
   * turns a refused login into an unreadable blob, which is why the login screen could not show
   * why it failed. Now the whole API answers `{ error: "…" }` at the status the controller asked
   * for, and `readApiError` on the front has one shape to read.
   *
   * The middlewares that answer for themselves — `validate`, the CSRF and session checks — are
   * unaffected: they never call `next(err)`, precisely because this was missing. */
  app.use(require("./utils/errorHandlerMiddleware"));

  if (process.env.NODE_ENV === "production") {
    cronMysql();
  }

  app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));
};

// Exit rather than leave an unhandled rejection: an unreachable Redis or a missing secret
// has to stop the process so pm2 reports it as errored instead of keeping a server up that
// cannot authenticate anyone.
bootstrap().catch((error) => {
  console.error(`[bootstrap] ${error.message}`);
  process.exit(1);
});
