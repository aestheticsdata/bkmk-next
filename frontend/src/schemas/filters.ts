import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { ALARM_STATES, PRIORITY_FILTER_LEVELS, queryFlagSchema, starsSchema } from "@src/schemas/primitives";
import { z } from "zod";

import type { PriorityFilter } from "@src/schemas/primitives";

/* The index's filter object (COS-318, completed by COS-300).
 *
 * It has no network boundary of its own: it lives in the **query string**, the modal
 * writes it and the index reads it back to hand it straight to the backend. Which
 * makes it a boundary all the same — the URL's, where everything is a string and anyone
 * can write anything.
 *
 * Two shapes, and both are needed: the form's, typed, and the URL's, where booleans are
 * `1` and lists are comma-joined strings.
 *
 * ⚠️ **Six fields, one per control of the filter modal, and no seventh.** Two parameters COS-299 had
 * are gone, and both because the modal's controls could not be built out of them:
 *
 * - `starred` — a flag for `stars > 0`. `stars` is a **minimum** now (the modal's `1+ … 5`), so
 *   "rated at all" is `stars: 1` and the second parameter said nothing the first could not.
 * - `reminder` — an exact alarm frequency, which only the legacy filter panel's dropdown ever sent.
 *   It left with that panel; `alarm: "due"` answers the question it was reached for.
 *
 * Which leaves each control owning exactly one field. A filter that can be written two ways is a
 * filter that will be read two ways. */

/** The values as the modal manipulates them. */
export const FiltersSchema = z.object({
  /** Full-text search on the title. The backend turns it into a `LIKE` by replacing
   *  commas with `%`, so a sequence of words becomes "in this order, with anything in
   *  between". */
  title: z.string().max(FIELD_LIMITS.title).optional(),
  /** Presence, not value: "only those with a screenshot". Same for the next two — the
   *  backend tests `IS NOT NULL`. */
  screenshot: z.boolean().optional(),
  url: z.boolean().optional(),
  notes: z.boolean().optional(),
  categories_id: z.array(z.coerce.number().int()).optional(),
  /** **A minimum**, not an exact count (COS-300): `3` is the modal's `3+`, and the backend compares
   *  with `>=`. It used to be an equality, which made `3+` impossible to express and hid the four-
   *  and five-star records from anyone asking for three. */
  stars: starsSchema.optional(),
  /** Which side of the reminder question — see `ALARM_STATES`. */
  alarm: z.enum(ALARM_STATES).optional(),
  /** A list, as the spec's filter object has it: the rail's `prio high` sends `high,highest` and the
   *  modal's `—` sends `none`. */
  priority: z.array(z.enum(PRIORITY_FILTER_LEVELS)).optional(),
});

export type Filters = z.infer<typeof FiltersSchema>;

/** The same thing seen from the URL. Everything is a string, flags are `"1"`, and
 *  categories arrive comma-joined. `catch` rather than `optional` on the numeric fields:
 *  a tampered query string should be ignored, not fail the page render.
 *
 *  ⚠️ The three flags use `queryFlagSchema`, **not** `z.coerce.boolean()` (COS-299): coercion is
 *  `Boolean(value)`, so the string `"0"` is `true` and `?screenshot=0` switched the filter **on**.
 *  See the note on that schema. */
export const FiltersQuerySchema = z.object({
  page: z.coerce.number().int().min(0).catch(0),
  title: z.string().optional(),
  screenshot: queryFlagSchema.optional(),
  url: queryFlagSchema.optional(),
  notes: queryFlagSchema.optional(),
  categories_id: z
    .string()
    .transform((value) => value.split(",").map(Number).filter(Number.isInteger))
    .optional(),
  stars: starsSchema.optional().catch(undefined),
  /* The reminder state and the priority list, as the rail and the modal write them into the URL.
   *
   * `catch` on both, like the numeric fields above: a value from outside the enum is dropped rather
   * than rendering an error page, and if nothing survives the list the whole filter goes. That is
   * also what makes a link written before COS-300 — `?alarm=1`, `?starred=1` — degrade to no filter
   * instead of to an error. */
  alarm: z.enum(ALARM_STATES).optional().catch(undefined),
  priority: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .filter((level): level is PriorityFilter => PRIORITY_FILTER_LEVELS.includes(level as PriorityFilter)),
    )
    .transform((levels) => (levels.length > 0 ? levels : undefined))
    .optional()
    .catch(undefined),
  /** Sort column, prefixed with `-` for descending order. The list is the one in
   *  `getBookmarksController`'s `switch`: any other value fell into its `default` and
   *  sorted nothing. */
  sort: z
    .enum(["link", "title", "stars", "notes", "priority", "screenshot", "alarm", "date", "tags"])
    .or(z.enum(["-link", "-title", "-stars", "-notes", "-priority", "-screenshot", "-alarm", "-date", "-tags"]))
    .optional()
    .catch(undefined),
});

export type FiltersQuery = z.infer<typeof FiltersQuerySchema>;
