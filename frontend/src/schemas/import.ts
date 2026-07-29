import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { z } from "zod";

/* Bookmark import (COS-318) — `POST /bookmarks/upload`.
 *
 * The file goes out as `multipart/form-data` under the `bookmark_file` field, and the
 * backend is what parses it: either a `title;link` CSV, or the browsers' Netscape export,
 * whose first two lines it skips before reading in pairs.
 *
 * So the front sees **no parsed entry** today: the response is a `{ msg }`, and on failure
 * the backend adds the offending line. The entry and summary schemas below describe what
 * UI 08 (COS-304) has to show — a preview before upload, a report after — and what the
 * backend will have to return for it. They are wired nowhere until that ticket moves the
 * parsing. */

/** One line of the file, as the parser produces it. */
export const ImportEntrySchema = z.object({
  title: z.string().min(1).max(FIELD_LIMITS.title),
  link: z.string().min(1).max(FIELD_LIMITS.url),
});

export type ImportEntry = z.infer<typeof ImportEntrySchema>;

export const ImportEntryListSchema = z.array(ImportEntrySchema);

/** The report of an import run. */
export const ImportSummarySchema = z.object({
  parsed: z.number().int().min(0),
  imported: z.number().int().min(0),
  skipped: z.number().int().min(0),
  errors: z.array(z.object({ line: z.number().int().optional(), reason: z.string() })).default([]),
});

export type ImportSummary = z.infer<typeof ImportSummarySchema>;

/** What the backend **actually** returns today: a message, plus on failure the url or
 *  title whose insert blew up. */
export const ImportResponseSchema = z.object({
  msg: z.string(),
  url: z.string().optional(),
  title: z.string().optional(),
});

export type ImportResponse = z.infer<typeof ImportResponseSchema>;
