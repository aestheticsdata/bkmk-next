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
    baseCurrency,
    registerDate,
    language,
  } = req.body;

  if (!name || !email || !password) {
    return next(createError(500, 'Please enter all fields'));
  }

  const sqlUser = `
    SELECT * FROM Users
    WHERE email="${email}";
  `;
  dbConnection.query(
    sqlUser,
    (err, users) => {
      if (users.length > 0) { return next(createError(500, 'Email already exists')); }

      const newUser = {
        name,
        email,
        password,
        baseCurrency,
        registerDate,
        language,
      };

      bcrypt.genSalt(10, (err, salt) => {
        if (err) console.error('There was an error during salt', err);
        else {
          bcrypt.hash(newUser.password, salt, async (err, hash) => {
            if (err) console.error('There was an error during hash', err);
            else {
              newUser.password = hash;
              console.log("registerDate", format(new Date(registerDate), "yyyy-MM-dd HH:mm:ss"));
              const sqlCreateUser = `
                INSERT INTO Users (name, password, email, registerDate, language, baseCurrency)
                VALUES (${newUser.name}", "${newUser.password}", "${newUser.email}", "${format(new Date(registerDate), "yyyy-MM-dd HH:mm:ss")}", "fr", "EUR");`;
              dbConnection.query(
                sqlCreateUser,
                () => {
                  signIn(res, {
                    ID: newUser.ID,
                    name: newUser.name,
                    email: newUser.email,
                    language: "fr",
                    baseCurrency: "EUR",
                  });
                }
              );
            }
          });
        }
      });
    }
  )
};



