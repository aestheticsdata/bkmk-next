/* The three ways out of the index (COS-333).
 *
 * bkmk knew how to import and not how to export. The only readable copy of an account's records was
 * the `mysqldump` the cron ships over SFTP every twelve hours, and a dump is not data anybody reads.
 * A self-hosted index you cannot leave is a lock-in with extra steps, on a product whose sign-up
 * screen says `self-hosted · no tracking`.
 *
 * ⚠️ **`json` is faithful and the other two are readable, and that is a decision, not an
 * inconsistency.** Titles and notes are stored percent-encoded — 1 154 of the dev index's 1 280
 * active titles, and all 19 of its notes — which is the defect DATA 07 (COS-334) exists to fix. So:
 *
 * - **`json` writes what the database holds**, undecoded. It is the backup *and* the diagnostic the
 *   ticket ordered this one before DATA 07 for: it shows exactly which rows carry the encoding,
 *   which is knowledge that disappears the moment anything decodes them.
 * - **`csv` and `html` are read by something other than bkmk** — its own import, and a browser — so
 *   they carry the text as a person would read it. `decode` is the same forgiving one the screens
 *   use: a `%` that is not an escape is text, not an error.
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

/** The forgiving decode, `frontend/helpers/decodeNote` on the server side. `decodeURIComponent`
 *  throws on a `%` that is not an escape — a note that simply says `100%` — and the raw text is the
 *  right answer then. */
const decode = (value) => {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

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

/* ⚠️ **`textEncoding` is in the file on purpose.** An export whose titles read `Framework%20reimagined`
 * looks corrupted to whoever opens it a year from now, and the honest place to say "this is how the
 * database holds them, and there is a ticket" is the file itself. It comes out `raw` until COS-334
 * runs, and the line goes when the encoding does. */
const toJson = (rows, { exportedAt }) =>
  `${JSON.stringify(
    {
      format: "bkmk/json",
      version: 1,
      exportedAt,
      count: rows.length,
      textEncoding: "raw — titles and notes are stored percent-encoded on records written before COS-334",
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
  decode(value)
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
      const note = decode(row.notes);
      const link =
        `    <DT><A HREF="${escapeHtml(row.original_url)}" ADD_DATE="${addDate(row.date_added)}"` +
        `${tags ? ` TAGS="${escapeHtml(tags)}"` : ""}>${escapeHtml(decode(row.title))}</A>`;
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

module.exports = { EXPORT_FORMATS, decode };
