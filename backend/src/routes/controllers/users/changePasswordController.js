const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const dbConnection = require("../../../db/dbinitmysql");
const establishSession = require("./helpers/signInHelper");

/**
 * `PATCH /users/me/password` (COS-404) — the `change password` entry COS-321 drew and left
 * disabled, because the route did not exist yet.
 *
 * ⚠️ **A wrong current password answers 400, not 401.** `sessionAuthMiddleware` has already let
 * this request through — there is a valid session — and `useRequestHelper`'s interceptor treats
 * 401 as "the session is gone, go to `/login`" (COS-296). Answering 401 here would bounce someone
 * who just mistyped a field they are looking at straight out of the app they are still signed
 * into. 400 says "the request was wrong", which is what a bad current password is.
 *
 * Success **replays `establishSession`**, the exact helper sign-in and sign-up already share: the
 * session is regenerated, every other session this account holds is dropped, a fresh CSRF token
 * is issued, and the response is the same `{user, csrfToken}` shape those two routes answer. That
 * is what keeps the person who just changed their password signed in on this device while ending
 * the old password's usefulness anywhere else it might have been used — the same "one active
 * session per user" guarantee sign-in gives, applied to the moment the credential itself changes.
 */
const WRONG_PASSWORD = "current password is incorrect";

module.exports = async (req, res, next) => {
  const { currentPassword, newPassword } = req.validated.body;

  const conn = await dbConnection();

  try {
    const [rows] = await conn.execute(
      "SELECT id, name, email, password, recovery_passphrase FROM user WHERE id = ?;",
      [req.user.id],
    );
    const user = rows[0];

    // The session outlived the account — same guard `getMeController` uses, for the same reason.
    if (!user) {
      return req.session.destroy(() => res.status(401).json({ error: "Session required" }));
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return next(createError(400, WRONG_PASSWORD));
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await conn.execute("UPDATE user SET password = ? WHERE id = ?;", [passwordHash, user.id]);

    return await establishSession(req, res, user, 200);
  } finally {
    await conn.end();
  }
};
