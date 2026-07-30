const establishSession = require("./helpers/signInHelper");
const bcrypt = require("bcryptjs");
const dbConnection = require("../../../db/dbinitmysql");
const createError = require("http-errors");

/**
 * ⚠️ **One status and one message for every way this can fail** (COS-297).
 *
 * It used to answer `500 "User does not exist"` or `500 "Invalid credentials"` depending on
 * which check failed. Two problems, and the login screen needs both fixed:
 *
 * - **500 is the wrong code.** Nothing broke; the credentials were refused. `useRequestHelper`
 *   and the login screen both key off the status, and a 500 reads as "the API is down" — which
 *   is not what the user should be told to do something about.
 * - **The two messages were an account oracle.** Telling an anonymous caller that an address
 *   is unknown, on an unauthenticated route with no rate limit, is a way to enumerate who has
 *   an account here. The same 401 and the same sentence now come back either way.
 */
const REFUSED = "invalid credentials";

module.exports = async (req, res, next) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return next(createError(400, "Please enter all fields"));
  }

  // Check for existing user.
  //
  // Prepared, not interpolated (COS-295). This is the route the injection was on: `email`
  // arrives straight from `req.body` on the one endpoint that by definition has no
  // authentication in front of it. The zod schema narrowed it to something e-mail shaped,
  // which is not the same as closing it — a placeholder is.
  const conn = await dbConnection();
  const [users] = await conn.execute("SELECT * FROM user WHERE email = ?;", [email]);
  await conn.end();

  if (users.length === 0) return next(createError(401, REFUSED));

  // Validate password
  const isMatchPassword = await bcrypt.compare(password, users[0].password);
  if (!isMatchPassword) return next(createError(401, REFUSED));

  return establishSession(req, res, users[0], 200);
};
