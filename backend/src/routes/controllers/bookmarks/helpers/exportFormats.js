/* The three ways out of the index (COS-333).
 *
 * bkmk knew how to import and not how to export. The only readable copy of an account's records was
 * the `mysqldump` the cron ships over SFTP every twelve hours, and a dump is not data anybody reads.
 * A self-hosted index you cannot leave is a lock-in with extra steps, on a product whose sign-up
 * screen says `self-hosted · no tracking`.
 *
 * ⚠️ **`json` was faithful and the other two were readable, and there is no difference left**
 * (COS-334). Titles and notes were stored percent-encoded — 1 154 of the dev index's 1 280 active
 * titles, and all 19 of its notes — so `json` wrote the column undecoded and the two interchange
 * formats undid the encoding on the way out. That split was this file's half of the defect, and it
 * had a job: writing the encoding down was the diagnostic the owner ordered this ticket *before* the
 * migration for, since which rows carried it is knowledge that disappears the moment anything decodes
 * them. It has been read, it decided the migration's rule, and `2026-08-01-decode-text.js` has run.
 *
 * So all three formats now write the same text, and the `decode` that stood between them is gone
 * with the `textEncoding` field that apologised for it. What still differs between them is what each
 * one's *reader* cannot swallow: `csv` has no quoting, `html` is markup.
 *
 * ⚠️ **A record with no url is in the `json` and in neither of the other two.** 43 of the dev index's
 * active records have none. `title;` re-imported is a line the parser counts as malformed, and
 * `<A HREF="">` is a link to the page you are on. The faithful format keeps them; the interchange
 * formats cannot carry them.
 *
 * **Screenshots are filenames, in every format.** The image is a file on the host, reachable through
 * `GET /bookmarks/upload/:id`; putting base64 in a backup would multiply its size by the one thing
 * in it nobody can read.
 */

const DATE = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : (value ?? null));

/** One record, as `json` writes it: the columns that are the bookmark, and nothing that is only the
 *  database's bookkeeping (`user_id`, `url_id`, `active`). `id` stays — it is what a link into this
 *  application is built from, and what makes an export correlatable with the next one. */
const asRecord = (row) => ({
  id: row.id,
  title: row.title,
  url: row.original_url ?? null,
  notes: row.notes ?? null,
  stars: row.stars ?? 0,
  priority: row.priority ?? null,
  categories: (row.categories ?? []).map((category) => ({ name: category.name, color: category.color })),
  /** The alarm is a frequency in days, not a date — see the alarms screen. */
  reminder: row.alarm_frequency ?? null,
  screenshot: row.screenshot ?? null,
  addedAt: DATE(row.date_added),
  modifiedAt: DATE(row.date_last_modified),
});

/* ⚠️ **`textEncoding` was a field here, and it is gone** (COS-334). It said, in the file, that titles
 * reading `Framework%20reimagined` were the database's doing and that there was a ticket — an export
 * that looks corrupted a year from now should explain itself rather than be explained. The ticket has
 * run, so the sentence would now be false, and a `textEncoding: "raw"` left behind out of caution
 * would be one more thing to keep true. `version` is what a reader checks; it does not move, because
 * the shape of a record has not changed — a title that used to arrive escaped simply arrives as it
 * reads. */
const toJson = (rows, { exportedAt }) =>
  `${JSON.stringify(
    {
      format: "bkmk/json",
      version: 1,
      exportedAt,
      count: rows.length,
      bookmarks: rows.map(asRecord),
    },
    null,
    2,
  )}\n`;

/** The separator cannot appear in a field: this format has no quoting, and neither does the parser
 *  that reads it back (`parseImportFile` splits the line on the first `;`). A title carrying one
 *  would silently move half of itself into the url, and a newline would make it two lines. None of
 *  the dev index's 1 280 titles carries either, which is what makes a replacement the right size of
 *  answer rather than a format change.
 *
 *  The runs are collapsed afterwards rather than in one pass: `one; two` replaced in place leaves
 *  `one  two`, two spaces where the separator was beside one. */
const csvSafe = (value) =>
  String(value ?? "")
    .replace(/[;\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** `title;url` per line — the exact shape `POST /bookmarks/import` reads, so an export of one account
 *  is an import into another. */
const toCsv = (rows) =>
  rows
    .filter((row) => row.original_url)
    .map((row) => `${csvSafe(row.title)};${row.original_url}`)
    .join("\n")
    .concat("\n");

const escapeHtml = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** `ADD_DATE` is unix seconds, which is what every browser writes and reads. A `DATE` column has no
 *  time in it, so this is midnight — the day is the whole of what bkmk knows. */
const addDate = (value) => (value instanceof Date ? Math.floor(value.getTime() / 1000) : "");

/* The Netscape bookmark file, which is what browsers import. Not a modern format and not a choice:
 * it is the only one Chrome, Firefox and Safari all read.
 *
 * `TAGS` is the extension Firefox reads for categories; Chrome ignores the attribute and keeps the
 * link. `<DD>` is the note, and it may run to several lines — 8 of the dev index's 19 notes do — which
 * is fine here and is exactly what `csv` cannot carry. */
const toHtml = (rows, { exportedAt }) => {
  const items = rows
    .filter((row) => row.original_url)
    .map((row) => {
      const tags = (row.categories ?? []).map((category) => category.name).join(",");
      const note = row.notes ?? "";
      const link =
        `    <DT><A HREF="${escapeHtml(row.original_url)}" ADD_DATE="${addDate(row.date_added)}"` +
        `${tags ? ` TAGS="${escapeHtml(tags)}"` : ""}>${escapeHtml(row.title)}</A>`;
      return note ? `${link}\n    <DD>${escapeHtml(note)}` : link;
    })
    .join("\n");

  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. It will be read and overwritten. DO NOT EDIT! -->
<!-- bkmk export, ${escapeHtml(exportedAt)} -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${items}
</DL><p>
`;
};

/** What each format is called, what it is served as, and what writes it. The keys are the enum
 *  `exportQuerySchema` accepts, so a format cannot be added in one place and missing in the other. */
const EXPORT_FORMATS = {
  json: { extension: "json", contentType: "application/json; charset=utf-8", write: toJson },
  csv: { extension: "csv", contentType: "text/csv; charset=utf-8", write: toCsv },
  html: { extension: "html", contentType: "text/html; charset=utf-8", write: toHtml },
};

module.exports = { EXPORT_FORMATS };
