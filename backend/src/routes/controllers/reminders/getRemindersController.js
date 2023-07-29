const dbConnection = require('../../../db/dbinitmysql');

module.exports = async (req, res) => {
  const sql = `
    SELECT b.* FROM bookmark b 
    INNER JOIN alarm a ON b.alarm_id = a.id
    WHERE b.user_id = "${req.query.userID}"`;

  const conn = await dbConnection();

  try {
    const [result] = await conn.execute(sql);
    console.log("result reminders : ", result[0]);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ msg: "error getting reminders : " + e });
  }
};
