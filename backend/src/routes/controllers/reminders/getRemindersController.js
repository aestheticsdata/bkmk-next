const dbConnection = require("../../../db/dbinitmysql");

/** Days until an alarm next fires, computed by MySQL.
 *
 *  An alarm has no next-fire column: it repeats every `frequency` days from `date_added`. So the
 *  distance to the next one is `frequency - (days_elapsed mod frequency)`, wrapped in one more `MOD`
 *  so that an alarm firing **today** comes out 0 rather than a whole period.
 *
 *  ⚠️ **The same expression as `getBookmarksController`'s `alarm=due` filter** (COS-300), which is
 *  why it is written the same way down to the parentheses: the index's `≤ 3d` segment and this
 *  column have to agree about which alarms are imminent, and two spellings of one formula drift.
 *
 *  Interpolated rather than parameterised because it contains no request value — every identifier in
 *  it is written in this file.
 */
const DAYS_UNTIL_NEXT_FIRE =
  "MOD(alarm.frequency - MOD(DATEDIFF(CURDATE(), alarm.date_added), alarm.frequency), alarm.frequency)";

/* `GET /reminders` — every armed alarm, with how long until it rings (COS-304).
 *
 * ⚠️ **This used to return only what fires today**, and the screen above it now needs the whole
 * inventory: the alarms screen draws a countdown per row and a fourteen-day load chart, and neither
 * can be built from a list where every entry rings in zero days. The filter it replaced was a JS
 * loop over the full result set doing `differenceInDays(now, alarm_added) % frequency === 0` — the
 * same arithmetic, one row at a time, in the wrong process. `alarm_days_until = 0` is that list, and
 * the client can still ask for it.
 *
 * The two counters in the chrome move with it, and towards the truth: the tab reads `alarms NNN` and
 * the status bar `N armed`, which is what they now count. Before this they counted today's ringing
 * ones under a word that means something else.
 *
 * **`b.active = 1` is a fix, not tidying.** Deletion is soft — `deleteBookmarkController` flips the
 * flag and leaves the alarm row alone — so a deleted bookmark kept ringing here, and kept being
 * counted in the chrome, with no screen that could reach it.
 *
 * `alarm.frequency > 0` guards the modulo: the column has no constraint, and `MOD(x, 0)` is `NULL`,
 * which would sort a row to the end of the list with an empty countdown rather than fail.
 *
 * `alarm_next_fire` is computed here rather than added client-side from `alarm_days_until`, so that
 * the date and the number of days cannot disagree: both are read off the server's `CURDATE()`, and a
 * browser an hour past midnight in another zone would have produced a different day.
 *
 * ⚠️ **`ORDER BY` names the select alias**, which MySQL allows and which is the point: repeating the
 * expression a third time is how the ordering and the column stop matching. */
module.exports = async (req, res) => {
  const sql = `
    SELECT b.*,
           alarm.id AS alarm_id,
           alarm.frequency AS alarm_frequency,
           alarm.date_added AS alarm_added,
           ${DAYS_UNTIL_NEXT_FIRE} AS alarm_days_until,
           DATE_ADD(CURDATE(), INTERVAL ${DAYS_UNTIL_NEXT_FIRE} DAY) AS alarm_next_fire,
           u.original AS original_url
    FROM bookmark b
    INNER JOIN alarm ON b.alarm_id = alarm.id
    LEFT JOIN url u ON b.url_id = u.id
    WHERE b.user_id = ? AND b.active = 1 AND alarm.frequency > 0
    ORDER BY alarm_days_until ASC, b.title ASC
  `;

  const conn = await dbConnection();

  try {
    const [reminders] = await conn.execute(sql, [req.query.userID]);
    await conn.end();
    return res.status(200).json(reminders);
  } catch (e) {
    await conn.end();
    return res.status(500).json({ msg: "error getting reminders : " + e });
  }
};
