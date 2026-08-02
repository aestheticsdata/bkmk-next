/**
 * `GET /users/me` (COS-294) — who the cookie says you are, plus the CSRF token.
 *
 * This is what hydrates the client on load: the session cookie is `httpOnly`, so the front
 * has no way to know it is signed in other than asking. It also re-hands the CSRF token,
 * which the client keeps in memory only and therefore loses on every reload.
 *
 * The query is parameterised. Nothing here is client-supplied — the id comes from our own
 * session — but COS-295 is about to convert the rest of the API, and new SQL has no reason
 * to be written the old way.
 *
 * `recovery_passphrase` is selected only so `toAuthUser` can turn it into `hasRecoveryPassphrase`
 * (COS-404) — the hash itself never reaches `res.json`.
 */
const dbConnection = require("../../../db/dbinitmysql");
const { getOrCreateCsrfToken } = require("../../../auth/csrfToken");
const toAuthUser = require("./helpers/toAuthUser");

module.exports = async (req, res) => {
  const conn = await dbConnection();
  const [users] = await conn.execute(
    "SELECT id, name, email, recovery_passphrase FROM user WHERE id = ?;",
    [req.user.id],
  );
  await conn.end();

  // The session outlived the account. Ten-minute sessions make this unlikely rather than
  // impossible, and answering 200 with no user would leave the client signed in to nothing.
  if (users.length === 0) {
    return req.session.destroy(() => res.status(401).json({ error: "Session required" }));
  }

  return res.json({
    user: toAuthUser(users[0]),
    csrfToken: getOrCreateCsrfToken(req),
  });
};
