import { PRIORITY_LEVELS } from "@src/schemas/primitives";

import type { Priority } from "@src/schemas/primitives";

/* The values the record's controls offer (COS-302). Shared with the edit modal (COS-319), which
 * edits the same seven fields with the same controls. */

/** The priority segments, **most urgent first, `—` last** — the filter modal's order, and for the
 *  same reason: the absence of a level belongs at the end of a row of levels.
 *
 *  ⚠️ **Four levels and not the handoff's three.** `ds/PriorityBars` already made this call and the
 *  argument is unchanged: the column holds `low · medium · high · highest`, a three-way control
 *  could not express `highest`, and a redesign is not allowed to quietly drop a value that records
 *  already carry. The empty string is "no level", which is what the backend stores as `NULL`. */
export const PRIORITY_SEGMENTS: readonly (Priority | "")[] = [...[...PRIORITY_LEVELS].reverse(), ""];

/** How often the reminder fires, in days.
 *
 *  ⚠️ **Not the handoff's `T-1d · T-3d · T-7d · date…`**, which reads as a countdown to a deadline.
 *  The `alarm` table holds a `frequency` and a `date_added`, and `getRemindersController` fires
 *  whenever the number of days since that date is a multiple of the frequency — so it is a repeat
 *  interval, and there is no deadline for `date…` to set. These six are the intervals the legacy
 *  form offered (`@components/common/alarm/constants`, in French); they are the ones records in the
 *  index already use, so the set is not ours to reduce. `0` is not one of them: "no alarm" is the
 *  absence of the row, which the `off` segment writes as `null`. */
export const ALARM_FREQUENCIES: readonly number[] = [1, 2, 5, 10, 15, 30];
