import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { starsSchema } from "@src/schemas/primitives";
import { z } from "zod";

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
});

export type Filters = z.infer<typeof FiltersSchema>;

/** The same thing seen from the URL. Everything is a string, flags are `"1"`, and
 *  categories arrive comma-joined. `catch` rather than `optional` on the numeric fields:
 *  a tampered query string should be ignored, not fail the page render. */
export const FiltersQuerySchema = z.object({
  page: z.coerce.number().int().min(0).catch(0),
  title: z.string().optional(),
  screenshot: z.coerce.boolean().optional(),
  url: z.coerce.boolean().optional(),
  notes: z.coerce.boolean().optional(),
  categories_id: z
    .string()
    .transform((value) => value.split(",").map(Number).filter(Number.isInteger))
    .optional(),
  reminder: z.coerce.number().int().positive().optional().catch(undefined),
  stars: starsSchema.optional().catch(undefined),
  /** Sort column, prefixed with `-` for descending order. The list is the one in
   *  `getBookmarksController`'s `switch`: any other value fell into its `default` and
   *  sorted nothing. */
  sort: z
    .enum(["link", "title", "stars", "notes", "priority", "screenshot", "alarm", "date"])
    .or(z.enum(["-link", "-title", "-stars", "-notes", "-priority", "-screenshot", "-alarm", "-date"]))
    .optional()
    .catch(undefined),
});

export type FiltersQuery = z.infer<typeof FiltersQuerySchema>;
