const { format } = require("date-fns");
const dbConnection = require("../../../db/dbinitmysql");

module.exports = async (req, res) => {
  const conn = await dbConnection();
  const { id } = req.params;

  const sqlInactiveFlag = `
    UPDATE bookmark SET active=0 WHERE id=?;
  `;

  const sqlInactiveDate = `
    UPDATE bookmark SET date_inactive=? WHERE id=?;
  `;

  try {
    await conn.execute(sqlInactiveFlag, [id]);
    await conn.execute(sqlInactiveDate, [format(new Date(), "yyyy-MM-dd"), id]);
    await conn.end();
    return res.status(200).json({ msg: "bookmark deleted" });
  } catch (err) {
    await conn.end();
    return res.status(500).json({ msg: "error deleting bookmark : " + err });
  }
};
