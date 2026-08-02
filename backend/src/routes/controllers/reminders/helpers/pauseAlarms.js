/* The two writes behind `snooze` and `resume` (COS-330), in one file because two routes make them:
 * one alarm from `PATCH /reminders/:alarmId`, every alarm of the account from `PATCH /reminders`.
 *
 * ⚠️ **The `paused_at` test in each `WHERE` is the promise of idempotence, not decoration.** Without
 * `IS NULL` on the sleep, putting an already-sleeping alarm to sleep would rewrite `paused_at` to
 * today and lose every day it had already slept: waking would then slide `date_added` by less than
 * the real sleep, and the countdown would come back earlier than it stopped. `snooze all` over a
 * list where two rows already sleep is the common case, not the contrived one.
 *
 * **Waking slides the whole series by exactly the sleep**, which freezes the countdown rather than
 * shifting it: with `d' = d + (r - p)`, `(r - d') MOD f` equals `(p - d) MOD f`. `T-15d` when it goes
 * to sleep, `T-15d` when it wakes, forty days later. And `date_added` cannot land in the future — an
 * alarm is armed before it sleeps and sleeps before it wakes, so `d <= p <= r` gives `d' <= r`.
 *
 * **The scope is the session's, never the path's** (COS-322): `alarm` carries no owner, the bookmark
 * pointing at it does, so both statements join through `bookmark`. `b.active = 1` keeps a
 * soft-deleted record's alarm out of reach, exactly as the list does. */
const SLEEP = `
  UPDATE alarm
    INNER JOIN bookmark b ON b.alarm_id = alarm.id
     SET alarm.paused_at = CURDATE()
   WHERE b.user_id = ? AND b.active = 1 AND alarm.paused_at IS NULL`;

const WAKE = `
  UPDATE alarm
    INNER JOIN bookmark b ON b.alarm_id = alarm.id
     SET alarm.date_added = DATE_ADD(alarm.date_added, INTERVAL DATEDIFF(CURDATE(), alarm.paused_at) DAY),
         alarm.paused_at  = NULL
   WHERE b.user_id = ? AND b.active = 1 AND alarm.paused_at IS NOT NULL`;

/**
 * Puts the account's alarms to sleep, or wakes them. `alarmId` narrows the write to one; without it
 * the whole account moves, which is `snooze all`.
 *
 * Returns how many alarms actually moved — `0` when they were already in the asked-for state. The
 * single-alarm route tells that apart from "no such alarm" with a read of its own, because this
 * count cannot: the guard makes both cases report zero.
 *
 * @param {import("mysql2/promise").Connection} conn
 * @param {{ userId: number, paused: boolean, alarmId?: number }} options
 * @returns {Promise<number>}
 */
const pauseAlarms = async (conn, { userId, paused, alarmId }) => {
  const sql = (paused ? SLEEP : WAKE) + (alarmId ? " AND alarm.id = ?" : "");
  const params = alarmId ? [userId, alarmId] : [userId];

  const [result] = await conn.execute(sql, params);
  return result.affectedRows;
};

module.exports = pauseAlarms;
