const dbConnection = require("../../../db/dbinitmysql");
const pauseAlarms = require("./helpers/pauseAlarms");

/* `PATCH /reminders/:alarmId` — `snooze` and `resume` on one row (COS-330).
 *
 * ⚠️ **The ownership check is a read of its own, not an extra `AND` on the write** — the arrangement
 * `deleteBookmarkController` explains at length. Both refuse the write; only the read tells "not
 * yours" from "already in that state", because the guarded `UPDATE` reports zero rows either way. So
 * `404` means the alarm is not the caller's, and `200` covers a change and a no-op alike, which is
 * what makes the route idempotent from the client's side as well as the database's.
 *
 * An alarm that is not yours and an alarm that does not exist get the same `404`: two answers would
 * still say which identifiers are real. */
module.exports = async (req, res) => {
  const { alarmId } = req.validated.params;
  const { paused } = req.validated.body;

  const conn = await dbConnection();

  try {
    // The session's user, not the query string's — see `getBookmarksController` (COS-322).
    const [[alarm]] = await conn.execute(
      `SELECT alarm.id FROM alarm
         INNER JOIN bookmark b ON b.alarm_id = alarm.id
        WHERE alarm.id = ? AND b.user_id = ? AND b.active = 1`,
      [alarmId, req.user.id],
    );

    if (!alarm) {
      return res.status(404).json({ msg: "alarm not found" });
    }

    await pauseAlarms(conn, { userId: req.user.id, paused, alarmId });

    return res.status(200).json({ msg: paused ? "alarm paused" : "alarm resumed" });
  } catch (e) {
    return res.status(500).json({ msg: `error updating alarm : ${e}` });
  } finally {
    await conn.end();
  }
};
