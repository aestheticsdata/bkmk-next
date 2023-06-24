const dbConnection = require('../../../db/dbinitmysql');

module.exports = async (req, res) => {
  const sql = `
    SELECT * from category
    WHERE user_id="${req.query.userID}";
  `;

  const conn = await dbConnection();
  const [rows] = await conn.execute(sql);
  res.json(rows);
};
