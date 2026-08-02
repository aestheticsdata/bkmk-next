import { BookmarkSchema } from "@src/schemas/bookmarks";
import { dateLikeSchema, numberLikeSchema } from "@src/schemas/primitives";
import { z } from "zod";

/* `GET /reminders` (COS-318).
 *
 * The controller returns bookmarks joined to their alarm, but **without categories**: its
 * query has no `GROUP_CONCAT` and never goes through `marshallCategories`, so the
 * `categories` field `BookmarkSchema` carries is absent. Hence the `.omit()` rather than
 * an `.extend()` alone.
 *
 * The aliases differ from the record screen's too: `alarm_added` here,
 * `alarm_date_added` there. That is not a typo in this file, it is what the two queries
 * write. DATA 03 (COS-308) will align them.
 *
 * ⚠️ **The endpoint now returns every armed alarm, not the ones ringing today** (COS-304). The two
 * fields below are what changed with it, and they are why: the alarms screen needs the distance to
 * each next firing, and the list it used to return had that distance at zero on every row. The
 * "rings today" list is still reachable — it is `alarm_days_until === 0`. */

export const ReminderSchema = BookmarkSchema.omit({ categories: true }).extend({
  /** Re-aliased onto `alarm.id` by the join: never null here, the `INNER JOIN` excludes
   *  bookmarks with no alarm. */
  alarm_id: numberLikeSchema,
  /** Frequency in days — the alarm repeats every `alarm_frequency` days from `alarm_added`. Never
   *  zero: the query excludes those, because they are what makes the countdown below undefined. */
  alarm_frequency: numberLikeSchema,
  alarm_added: dateLikeSchema,
  /** The day the alarm was put to sleep, `null` while it runs (COS-330). It is what tells a row that
   *  stays in the list without ringing from one that is counting down — `snooze` keeps the row,
   *  `done` takes it away. */
  alarm_paused_at: dateLikeSchema.nullable(),
  /** Days until the next firing, `0` on the day itself. Computed by MySQL from the two fields above
   *  — see `getRemindersController` for the expression and for why it is not derived here.
   *
   *  ⚠️ **`null` on a sleeping alarm** (COS-330): a stopped clock has no next firing, and a number
   *  here would be a countdown counting down to nothing. */
  alarm_days_until: numberLikeSchema.nullable(),
  /** The date of that next firing. **A day, not a moment**: an alarm has no time of day anywhere in
   *  the schema, so nothing downstream may print one. `null` on a sleeping alarm, with the field
   *  above and for its reason. */
  alarm_next_fire: dateLikeSchema.nullable(),
});

export type Reminder = z.infer<typeof ReminderSchema>;

export const ReminderListSchema = z.array(ReminderSchema);
