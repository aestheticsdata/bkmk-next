const establishSession = require("./helpers/signInHelper");
const bcrypt = require("bcryptjs");
const dbConnection = require("../../../db/dbinitmysql");
const createError = require("http-errors");

module.exports = async (req, res, next) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return next(createError(500, "Please enter all fields"));
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

  if (users.length === 0) return next(createError(500, "User does not exist"));

  // Validate password
  const isMatchPassword = await bcrypt.compare(password, users[0].password);
  if (!isMatchPassword) return next(createError(500, "Invalid credentials"));

  return establishSession(req, res, users[0], 200);
};
