const dbConnection = require("../../../db/dbinitmysql");

/* `DELETE /reminders/:alarmId` — `done` (COS-330).
 *
 * ⚠️ **It disarms the record; it does not hide a row.** That is the owner's reading of the word: the
 * bookmark leaves the alarms list, and leaves it because it no longer has an alarm — the record's
 * `alarm` field reads `none`, the edit modal's segment goes back to `off`, and the index's `has
 * alarm` filter loses it. Keeping a `done` row and filtering it out of one screen would have given
 * "this record is armed" two answers and six readers to keep in step. It is also what makes the
 * screen ask before pressing it: the frequency and the arming date leave with the row.
 *
 * ⚠️ **`UPDATE` before `DELETE`, and both inside one transaction.** `bookmark.alarm_id` is a foreign
 * key, so deleting the alarm first is refused outright; and a failure between the two would leave a
 * bookmark pointing at a row that is gone. It is the same pair, in the same order, that
 * `editBookmarkController.applyAlarm` writes when the `reminder` field is emptied — the only other
 * way an alarm leaves.
 *
 * The ownership read is `patchAlarmController`'s, for the reason it gives there. */
module.exports = async (req, res) => {
  const { alarmId } = req.validated.params;

  const conn = await dbConnection();

  try {
    const [[alarm]] = await conn.execute(
      `SELECT alarm.id, b.id AS bookmark_id FROM alarm
         INNER JOIN bookmark b ON b.alarm_id = alarm.id
        WHERE alarm.id = ? AND b.user_id = ? AND b.active = 1`,
      [alarmId, req.user.id],
    );

    if (!alarm) {
      return res.status(404).json({ msg: "alarm not found" });
    }

    await conn.beginTransaction();
    await conn.execute("UPDATE bookmark SET alarm_id=NULL WHERE id=?", [alarm.bookmark_id]);
    await conn.execute("DELETE FROM alarm WHERE id=?", [alarm.id]);
    await conn.commit();

    return res.status(200).json({ msg: "alarm disarmed" });
  } catch (e) {
    await conn.rollback().catch(() => {});
    return res.status(500).json({ msg: `error disarming alarm : ${e}` });
  } finally {
    await conn.end();
  }
};
