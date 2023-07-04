const { format } = require('date-fns');
const dbConnection = require('../../../db/dbinitmysql');

module.exports = async (req, res) => {
  const conn = await dbConnection();
  const { id } = req.params;

  const sqlInactiveFlag = `
    UPDATE bookmark SET active=0 WHERE id=${id};
  `;

  const sqlInactiveDate = `
    UPDATE bookmark SET date_inactive="${format(new Date(), 'yyyy-MM-dd')}" WHERE id=${id};
  `;

  try {
    await conn.execute(sqlInactiveFlag);
    await conn.execute(sqlInactiveDate);
    return res.status(200).json({ msg: "bookmark deleted" });
  } catch (err) {
    return res.status(500).json({ msg: "error deleting bookmark : " + err });
  }
};
