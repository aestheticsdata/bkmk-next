import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { PRIORITY_LEVELS, queryFlagSchema, starsSchema } from "@src/schemas/primitives";
import { z } from "zod";

import type { Priority } from "@src/schemas/primitives";

/* The index's filter object (COS-318).
 *
 * It has no network boundary of its own: it lives in the **query string**, the modal
 * writes it and `useBookmarks` reads it back to hand it straight to the backend. Which
 * makes it a boundary all the same — the URL's, where everything is a string and anyone
 * can write anything.
 *
 * Two shapes, and both are needed: the form's, typed, and the URL's, where booleans are
 * `1` and lists are comma-joined strings. */

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
  /** Exact reminder frequency, in days. */
  reminder: z.coerce.number().int().positive().optional(),
  /** An exact star count, not a minimum: the backend compares with `=`. */
  stars: starsSchema.optional(),
  /* The index rail's scopes (COS-299) — the coarse cuts beside the fine filters above.
   *
   * `starred` is not `stars`: it asks "rated at all" (`> 0`) where `stars` asks "rated exactly
   * this" (`=`). `alarm` is not `reminder`: presence of an alarm, at any frequency. And `priority`
   * is a list, as the spec's filter object has it — the rail's `prio high` sends `high,highest`. */
  starred: z.boolean().optional(),
  alarm: z.boolean().optional(),
  priority: z.array(z.enum(PRIORITY_LEVELS)).optional(),
});

export type Filters = z.infer<typeof FiltersSchema>;

/** The same thing seen from the URL. Everything is a string, flags are `"1"`, and
 *  categories arrive comma-joined. `catch` rather than `optional` on the numeric fields:
 *  a tampered query string should be ignored, not fail the page render.
 *
 *  ⚠️ The five flags use `queryFlagSchema`, **not** `z.coerce.boolean()` (COS-299): coercion is
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
  reminder: z.coerce.number().int().positive().optional().catch(undefined),
  stars: starsSchema.optional().catch(undefined),
  /* The scopes, as the rail writes them into the URL (COS-299): two flags and a comma list.
   *
   * `catch` on the list, like the numeric fields above: an unknown level is dropped rather than
   * rendering an error page, and if nothing survives the whole filter goes. */
  starred: queryFlagSchema.optional(),
  alarm: queryFlagSchema.optional(),
  priority: z
    .string()
    .transform((value) =>
      value.split(",").filter((level): level is Priority => PRIORITY_LEVELS.includes(level as Priority)),
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
