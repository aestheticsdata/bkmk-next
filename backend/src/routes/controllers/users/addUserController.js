const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const { format } = require('date-fns');
const dbConnection = require('../../../db/dbinitmysql');
const signIn = require('./helpers/signInHelper');


module.exports = async (req, res, next) => {
  const {
    name,
    email,
    password,
    registerDate,
  } = req.body;

  if (!name || !email || !password) {
    return next(createError(500, 'Please enter all fields'));
  }

  const conn = await dbConnection();

  const sqlUser = `
    SELECT * FROM user
    WHERE email="${email}";
  `;
  const [user] = await conn.execute(sqlUser);
  if (user?.length > 0) { return next(createError(500, 'Email already exists')); }

  const newUser = {
    name,
    email,
    password,
    registerDate,
  };

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error('There was an error during salt', err);
      res.status(500).json({msg: "error adding new user : ", err});
      conn.end();
    } else {
      bcrypt.hash(newUser.password, salt, async (err, hash) => {
        if (err) {
          console.error('There was an error during hash', err);
          res.status(500).json({msg: "error adding new user : ", err});
          conn.end();
        } else {
          newUser.password = hash;

          const sqlCreateUser = `
            INSERT INTO user (name, password, email, register_date)
            VALUES ("${newUser.name}", "${newUser.password}", "${newUser.email}", "${format(new Date(registerDate), 'yyyy-MM-dd')}");`;

          try {
            const createdUser = await conn.execute(sqlCreateUser);
            signIn(res, {
              id: createdUser[0].insertId,
              name: newUser.name,
              email: newUser.email,
            });
          } catch (err) {
            res.status(500).json({msg: "error adding new user : ", err});
          } finally {
            conn.end();
          }
        }
      });
    }
  });
};



