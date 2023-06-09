const signIn = require('./helpers/signInHelper');
const bcrypt = require('bcryptjs');
const dbConnection = require('../../../db/dbinitmysql');
const createError = require('http-errors');


module.exports = async (req, res, next) => {
  const { email, password } = req.body;

  // Simple validation
  if(!email || !password) {
    return next(createError(500, 'Please enter all fields'));
  }

  // Check for existing user
  const sqlUser = `
    SELECT * FROM user
    WHERE email="${email}";
  `;

  const conn = await dbConnection();
  const [users] = await conn.execute(sqlUser);
  await conn.end();

  if (users.length === 0) return next(createError(500, 'User does not exist'));

  // Validate password
  const isMatchPassword = await bcrypt.compare(password, users[0].password);
  if (!isMatchPassword) return next(createError(500, 'Invalid credentials'));

  signIn(res, users[0]);
};
