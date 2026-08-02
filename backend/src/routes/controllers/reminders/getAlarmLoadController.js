const dbConnection = require("../../../db/dbinitmysql");

/** Fourteen, from the handoff's `next 14 days · load` and its fourteen bars. */
const LOAD_DAYS = 14;

/** Days until an alarm next fires.
 *
 *  ⚠️ **The third copy of this expression, and the reason it is copied rather than shared is that
 *  the other two live in files this one must not import** — `getRemindersController` and
 *  `getBookmarksController`'s `alarm=due` filter. All three have to agree about which alarms are
 *  imminent; the note on the first of them says so, and this is where a fourth spelling would first
 *  show up as a chart that disagrees with the countdowns printed above it. Written identically down
 *  to the parentheses. */
const DAYS_UNTIL_NEXT_FIRE =
  "MOD(alarm.frequency - MOD(DATEDIFF(CURDATE(), alarm.date_added), alarm.frequency), alarm.frequency)";

/* `GET /reminders/load` — the fourteen-day load, counted by the database (COS-310, DATA 05).
 *
 * ⚠️ **This is a move, not a de-mock.** UI 08 (COS-304) already counted real alarms; it counted them
 * in the browser, which it could because `GET /reminders` returns every armed alarm unpaginated. The
 * ticket's own words: nothing on screen changes when this lands. What changes is that the answer
 * stops depending on the client holding the complete set — the day that list is paginated, or the
 * day an account has more alarms than it is reasonable to ship, the chart would quietly start
 * charting a page instead of a fortnight.
 *
 * **An alarm is a repeat, so it lands in the window more than once.** One that rings in two days
 * every three rings on days 2, 5, 8 and 11 of the chart. That is the whole rule, and it is the
 * `MOD(o.n - days_until, frequency) = 0` below — the same arithmetic the front's `alarmLoad` did by
 * stepping a loop, which is why a daily alarm fills all fourteen bars rather than the first.
 *
 * **The offsets are generated, not joined from a table bkmk does not have.** A recursive CTE is
 * MySQL 8's answer to a numbers table, and driving the `LEFT JOIN` from it is what guarantees
 * **fourteen rows whatever the data** — including all fourteen at zero, and including an account
 * with no alarm at all. The front used to build that skeleton itself; a chart whose length depends
 * on the result set is a chart that silently shortens.
 *
 * ⚠️ **A sleeping alarm draws no bar** (COS-330), for the reason it has no fire date in the list
 * beside it: the fortnight is a forecast of firings, and an alarm whose clock is stopped has none to
 * forecast. It comes back the day it is woken, and its bars land on the slid series rather than on
 * the one it had before.
 *
 * `day` is dated from the server's `CURDATE()`, like `alarm_next_fire` next door, so the axis and
 * the countdowns cannot disagree — a browser an hour past midnight in another zone would have
 * labelled the first bar with a different day. It is what let the front drop `alarmsToday`, which
 * existed only to recover this date by subtraction.
 */
module.exports = async (req, res) => {
  const sql = `
    WITH RECURSIVE offsets (n) AS (
      SELECT 0
      UNION ALL
      SELECT n + 1 FROM offsets WHERE n + 1 < ${LOAD_DAYS}
    ),
    armed AS (
      SELECT alarm.id AS alarm_id,
             alarm.frequency AS frequency,
             ${DAYS_UNTIL_NEXT_FIRE} AS days_until
        FROM bookmark b
        INNER JOIN alarm ON b.alarm_id = alarm.id
       WHERE b.user_id = ? AND b.active = 1 AND alarm.frequency > 0 AND alarm.paused_at IS NULL
    )
    SELECT o.n                                   AS day_offset,
           DATE_ADD(CURDATE(), INTERVAL o.n DAY) AS day,
           COUNT(a.alarm_id)                     AS count
      FROM offsets o
      LEFT JOIN armed a
             ON o.n >= a.days_until
            AND MOD(o.n - a.days_until, a.frequency) = 0
     GROUP BY o.n
     ORDER BY o.n
  `;

  const conn = await dbConnection();

  try {
    const [days] = await conn.execute(sql, [req.user.id]);
    return res.status(200).json(days.map((day) => ({ day: day.day, count: Number(day.count) })));
  } finally {
    await conn.end();
  }
};
