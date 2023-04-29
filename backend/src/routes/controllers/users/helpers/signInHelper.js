const jwt = require('jsonwebtoken');

module.exports = (res, user) => {
  jwt.sign(
    { id: user.ID },
    process.env.JWT_SECRET,
    { expiresIn: '10h' },
    (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.ID,
          name: user.name,
          email: user.email,
          baseCurrency: user.baseCurrency,
          language: user.language,
        }
      });
    })
};
