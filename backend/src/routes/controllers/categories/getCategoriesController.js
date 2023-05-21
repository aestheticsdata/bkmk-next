const dbConnection = require('../../../db/dbinitmysql');

module.exports = async (req, res) => {
  const sql = `
    SELECT * from category
    WHERE user_id="${req.query.userID}";
  `;

  dbConnection.query(
    sql,
    (err, result) => {
      res.json(result)
    }
  );
}
