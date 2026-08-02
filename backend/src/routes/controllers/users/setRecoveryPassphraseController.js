const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const dbConnection = require("../../../db/dbinitmysql");

/**
 * `PATCH /users/me/passphrase` (COS-404) — the `set recovery passphrase` entry COS-321 drew and
 * left disabled, and the only way the 11 accounts that predate the column (COS-298) can ever get
 * one: `POST /users/recover` (COS-324) only spends a passphrase, it does not create one.
 *
 * Unlike `changePasswordController`, nothing here touches the session: the recovery passphrase is
 * never a login credential, so there is no session to regenerate and no other device to sign out.
 * The response says only whether one exists now, never the value — the same rule `getMeController`
 * follows for `GET /users/me`.
 *
 * Same 400-not-401 reasoning as `changePasswordController` for a wrong current password: the
 * session in front of this request is genuinely valid, and 401 would send `useRequestHelper` to
 * `/login` over what is really just a mistyped field.
 */
const WRONG_PASSWORD = "current password is incorrect";

module.exports = async (req, res, next) => {
  const { currentPassword, recoveryPassphrase } = req.validated.body;

  const conn = await dbConnection();

  try {
    const [rows] = await conn.execute("SELECT id, password FROM user WHERE id = ?;", [req.user.id]);
    const user = rows[0];

    if (!user) {
      return req.session.destroy(() => res.status(401).json({ error: "Session required" }));
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return next(createError(400, WRONG_PASSWORD));
    }

    const passphraseHash = await bcrypt.hash(recoveryPassphrase, 10);
    await conn.execute("UPDATE user SET recovery_passphrase = ? WHERE id = ?;", [passphraseHash, user.id]);

    return res.status(200).json({ hasRecoveryPassphrase: true });
  } finally {
    await conn.end();
  }
};
