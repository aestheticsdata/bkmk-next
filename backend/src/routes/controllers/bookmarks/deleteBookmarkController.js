const dbConnection = require('../../../db/dbinitmysql');

module.exports = async (req, res) => {
  const conn = await dbConnection();

  const sqlDelete = `
    UPDATE bookmark SET active=0 WHERE id=${req.params.id};
  `;

  try {
    await conn.execute(sqlDelete);
    return res.status(200).json({ msg: "bookmark deleted" });
  } catch (err) {
    return res.status(500).json({ msg: "error deleting bookmark : " + err });
  }
};
