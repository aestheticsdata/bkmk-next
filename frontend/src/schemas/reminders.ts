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
 * write. DATA 03 (COS-308) will align them. */

export const ReminderSchema = BookmarkSchema.omit({ categories: true }).extend({
  /** Re-aliased onto `alarm.id` by the join: never null here, the `INNER JOIN` excludes
   *  bookmarks with no alarm. */
  alarm_id: numberLikeSchema,
  /** Frequency in days. The controller only keeps a row when the number of days elapsed
   *  since `alarm_added` is a multiple of this value. */
  alarm_frequency: numberLikeSchema,
  alarm_added: dateLikeSchema,
});

export type Reminder = z.infer<typeof ReminderSchema>;

export const ReminderListSchema = z.array(ReminderSchema);
