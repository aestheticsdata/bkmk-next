const dbConnection = require('../../../db/dbinitmysql');
const differenceInDays = require('date-fns/differenceInDays');
const add = require('date-fns/add');

module.exports = async (req, res) => {
  const sql = `
    SELECT b.*, alarm.id AS alarm_id, alarm.frequency AS alarm_frequency, alarm.date_added AS alarm_added
    FROM bookmark b
    INNER JOIN alarm ON b.alarm_id = alarm.id
    WHERE b.user_id="${req.query.userID}"
  `;

  const conn = await dbConnection();
  let bookmarksToNotify = [];

  try {
    const [result] = await conn.execute(sql);
    for (const bookmark of result) {
      let difference = differenceInDays(new Date(), add(new Date(bookmark.alarm_added), {days: bookmark.alarm_frequency}));
      console.log("différence : ", difference);
      if (difference === 0) {
        bookmarksToNotify.push(bookmark);
      }
    }
    return res.status(200).json(bookmarksToNotify);
  } catch (e) {
    return res.status(500).json({ msg: "error getting reminders : " + e });
  }
};
