import { dateLikeSchema, numberLikeSchema } from "@src/schemas/primitives";
import { z } from "zod";

/* The two aggregates the server counts (COS-310, DATA 05).
 *
 * They live together because they are one ticket and one idea — a number the screen shows that the
 * screen has no business computing — and apart from the endpoints they come from, which are two
 * because they belong to two domains. */

/** `GET /bookmarks/stats` — the rail's `storage` block.
 *
 *  ⚠️ **`records` is the whole index, not the current query's `total`.** The list endpoint answers
 *  what is filtered; these two are what the account holds, so `all 1278` and `shots 24/1278` stay
 *  the same number whichever category is selected. That is also what makes them a separate request
 *  rather than two more fields on the list response. */
export const IndexStatsSchema = z.object({
  records: numberLikeSchema,
  shots: numberLikeSchema,
});

export type IndexStats = z.infer<typeof IndexStatsSchema>;

/** One bar of `next 14 days · load`. */
export const AlarmLoadDaySchema = z.object({
  /** **A day, not a moment**, and it is the server's day: dated from the same `CURDATE()` the
   *  countdowns are measured against, so the axis and the rows cannot disagree. */
  day: dateLikeSchema,
  count: numberLikeSchema,
});

export type AlarmLoadDay = z.infer<typeof AlarmLoadDaySchema>;

/** `GET /reminders/load` — always fourteen entries, including all fourteen at zero. The query is
 *  driven from a generated list of offsets rather than from the alarms, so an account with nothing
 *  armed gets a full axis rather than a short one. */
export const AlarmLoadSchema = z.array(AlarmLoadDaySchema);
