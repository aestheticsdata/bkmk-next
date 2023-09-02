const dbConnection = require('../../../db/dbinitmysql');
const differenceInDays = require('date-fns/differenceInDays');

module.exports = async (req, res) => {
  const sql = `
    SELECT b.*, alarm.id AS alarm_id, alarm.frequency AS alarm_frequency, alarm.date_added AS alarm_added, u.original AS original_url
    FROM bookmark b
    INNER JOIN alarm ON b.alarm_id = alarm.id
    LEFT JOIN url u ON b.url_id = u.id
    WHERE b.user_id="${req.query.userID}"
  `;

  const conn = await dbConnection();
  let bookmarksToNotify = [];

  try {
    const [result] = await conn.execute(sql);
    for (const bookmark of result) {
      const difference = differenceInDays(new Date(), new Date(bookmark.alarm_added));
      const reminderHasOccurred = difference % bookmark.alarm_frequency === 0;
      if (reminderHasOccurred) {
        bookmarksToNotify.push(bookmark);
      }
    }
    await conn.end();
    return res.status(200).json(bookmarksToNotify);
  } catch (e) {
    await conn.end();
    return res.status(500).json({ msg: "error getting reminders : " + e });
  }
};
