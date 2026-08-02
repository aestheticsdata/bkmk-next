/**
 * Opens a session and answers with it — the single exit both sign-in and sign-up share
 * (COS-294). It used to sign a ten-hour JWT and hand it to the client in the response body;
 * the body now carries the CSRF token, and the identity travels in an `httpOnly` cookie the
 * client never reads.
 *
 * Three things happen in this order, and the order is the point:
 *
 * 1. **The session id is regenerated**, which is what makes session fixation a non-issue: a
 *    session cookie planted on a visitor before they sign in is discarded rather than
 *    inherited. `saveUninitialized: false` already made it unlikely; this closes it. A step
 *    ahead of the reference implementation — COS-323 tracks bringing the two back in line.
 * 2. **Every other session of this user is dropped** — one active session per user. It runs
 *    after the regeneration so the session being created is not in the store yet and cannot
 *    delete itself.
 * 3. **The CSRF token is rotated**, not reused: a new session gets a new token, so a token
 *    captured under the previous one is worthless.
 *
 * The id is stored as a **string**. bkmk's `user.id` is a MySQL `INT`, and the helpers ported
 * from pfa test it with `typeof userId === "string"`; storing a number there would make every
 * session read as anonymous. A string also matches what the rest of the API already handles —
 * `?userID=` has always arrived as one — and what `clearSessionsForUser` compares.
 *
 * `user` must now carry `recovery_passphrase` (the hash or `NULL`), not just `id`/`name`/`email`
 * (COS-404) — `toAuthUser` reads it to derive `hasRecoveryPassphrase`. `signInController` already
 * selects `SELECT *`, so it needs no change; `addUserController` was updated by the same ticket to
 * add it to the object it builds by hand.
 */
const redisService = require("../../../../redisService");
const { rotateCsrfToken } = require("../../../../auth/csrfToken");
const toAuthUser = require("./toAuthUser");

const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });

module.exports = async (req, res, user, status) => {
  await regenerateSession(req);
  await redisService.clearSessionsForUser(user.id);
  req.session.userId = String(user.id);

  return res.status(status).json({
    user: toAuthUser(user),
    csrfToken: rotateCsrfToken(req),
  });
};
