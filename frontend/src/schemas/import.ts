import { z } from "zod";

/* Bookmark import (COS-318, rewritten by COS-307) — the staging endpoints.
 *
 * The screen used to talk to one route, `POST /bookmarks/upload`, which took a file and imported
 * every line of it. There are three now, and they are the staging the handoff draws:
 *
 * - `POST /bookmarks/import/parse` — what is in the file, writing nothing;
 * - `POST /bookmarks/import` — the same file again, plus the options, written;
 * - `GET /bookmarks/import/last` — the account's most recent run.
 *
 * ⚠️ **The entry shapes describe what the server sends, and the front no longer produces them.**
 * The schemas that used to sit here were a description of an endpoint that did not exist yet, beside
 * a browser-side parser (`parseImport.ts`) that filled in for it. Both are gone: the parse arrives
 * over the wire, validated here, and there is one parser left, in the backend.
 */

/** `NEW` or `DUP`, as `markImportDuplicates` marks them. What "duplicate" means is documented on that
 *  helper: it was an exact match on the stored url and it is the **normal form** since COS-338, so
 *  the same page reached with `www.`, a trailing slash or a `?utm_source=` is one entry. */
export const IMPORT_STATES = ["NEW", "DUP"] as const;

/* ⚠️ The server also sends each entry's `normalised` — the key the state above was decided on — and
 * this schema drops it, as `z.object` drops anything it does not name. Nothing on this screen shows
 * a comparison key, and the two endpoints that need it are both on the other side of the wire. */
export const StagedEntrySchema = z.object({
  title: z.string(),
  link: z.string(),
  /** The host without `www.`, which is how the index files the row (COS-338). `null` when the link is
   *  not a url the `URL` constructor can read — still imported, it simply has no host to show. */
  host: z.string().nullable(),
  /** Its position in the file — the only stable key an entry has, since two lines can be identical
   *  and often are in an export taken twice. */
  at: z.number().int().min(0),
  state: z.enum(IMPORT_STATES),
});

export type StagedEntry = z.infer<typeof StagedEntrySchema>;

/** The four numbers under the staged table. They cover the **whole** file, while `entries` beside
 *  them is a sample of it — the endpoint caps what it returns, and `parsed` is what says so. */
export const ImportSummarySchema = z.object({
  parsed: z.number().int().min(0),
  new: z.number().int().min(0),
  duplicates: z.number().int().min(0),
  malformed: z.number().int().min(0),
});

export type ImportSummary = z.infer<typeof ImportSummarySchema>;

export const ImportParseResponseSchema = z.object({
  entries: z.array(StagedEntrySchema),
  summary: ImportSummarySchema,
});

export type ImportParseResponse = z.infer<typeof ImportParseResponseSchema>;

/** What the commit reports. `imported` and `skipped` are what the run wrote and what it passed over;
 *  `parsed` and `malformed` describe the file, unchanged from the preview. */
export const ImportCommitResponseSchema = z.object({
  msg: z.string(),
  parsed: z.number().int().min(0),
  imported: z.number().int().min(0),
  skipped: z.number().int().min(0),
  malformed: z.number().int().min(0),
});

export type ImportCommitResponse = z.infer<typeof ImportCommitResponseSchema>;

/** The right pane's footer. `null` for an account that has never imported — a zeroed line under a
 *  date that never happened would be a reading, and this screen has just stopped carrying one. */
export const LastImportResponseSchema = z.object({
  lastImport: z
    .object({
      filename: z.string(),
      entries: z.number().int().min(0),
      skipped: z.number().int().min(0),
      /** `yyyy-MM-dd`, formatted by the API from a `DATETIME`. */
      ranAt: z.string(),
    })
    .nullable(),
});

export type LastImport = z.infer<typeof LastImportResponseSchema>["lastImport"];

/** The two switches the commit accepts. `captureShots` is not among them: nothing in this
 *  application captures a screenshot from a url, so the API does not pretend to take the flag and
 *  the screen leaves it disabled — COS-329 is where that capture gets built. */
export type ImportOptions = {
  skipDuplicates: boolean;
  tagAsImported: boolean;
};
