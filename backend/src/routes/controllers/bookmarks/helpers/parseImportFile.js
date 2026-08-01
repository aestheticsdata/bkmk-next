const { normaliseUrl } = require("../../../../helpers/normaliseUrl");
const { FIELD_LIMITS } = require("../../../../schemas/fieldLimits");

/* The import file's parser, and now the only one (COS-307).
 *
 * ⚠️ **This file exists to end a duplication, not to start one.** UI 07 (COS-303) had to show what
 * was in a file *before* sending it, and no endpoint parsed without writing — so the screen grew its
 * own parser (`parseImport.ts`), deliberately mirroring `uploadBookmarksController`'s line for line,
 * with a header saying that DATA 02 would delete it. This is that deletion: the parse endpoint and
 * the commit endpoint both call this function, the front calls neither and reads the result off the
 * wire, and the two implementations that could drift are one.
 *
 * The shapes it reads are unchanged — a Session Buddy `.txt` and a `title;url` `.csv` — including
 * the two defects COS-303 fixed in both copies, kept here as the fixed version: the format is
 * decided by the **last** dot segment, and a line with no `;` is skipped rather than fatal.
 *
 * What it adds over the legacy controller is `malformed`, `host` and `normalised`. None of them
 * changes what is imported: the count is a number the handoff's summary asks for, the host is a
 * column the staged table draws, and the normal form is the key the duplicate question is asked on
 * (COS-338). A link the `URL` constructor cannot read is still imported, exactly as before — it
 * simply has no host to show.
 */

/** Which parser to run.
 *
 *  ⚠️ **The last dot segment, not the second.** `originalname.split(".")[1]` answered `"2026_07_11"`
 *  for `session_buddy.2026_07_11.csv`, so that file went down the `.txt` path and imported pairs of
 *  lines out of a csv — garbage, without failing. Fixed on both sides by COS-303 and kept here. */
const isCsv = (filename) => String(filename).toLowerCase().split(".").pop() === "csv";

/** A line that yielded a title and a link, but a link longer than the `url.original` column can
 *  hold. Counted as malformed rather than truncated: half a url is a link to somewhere else. */
const isOverLong = (link) => link.length > FIELD_LIMITS.url;

/** Titles are cut to the column rather than dropped — a long title is still the right bookmark.
 *  The legacy controller cut at 119 characters, a bound that made sense when it stored
 *  `encodeURIComponent(anyASCII(title))` and three bytes could come out of one character; see
 *  `commitImportController` on why it no longer stores it that way. */
const clampTitle = (title) => (title.length > FIELD_LIMITS.title ? title.slice(0, FIELD_LIMITS.title) : title);

/* An entry, with the two readings of its link that the rest of the import needs (COS-338).
 *
 * ⚠️ **`host` used to be `new URL(link).host` right here, and it is the shared helper now.** It kept
 * `www.`, so the staged table's middle column said `www.youtube.com` where the `host` column now
 * stored `youtube.com` — two answers to "which host is this" for one link, and the rail's host axis
 * would have been built on the other one. The visible consequence is that the staged column drops the
 * `www.`, which is also what the index will file the row under.
 *
 * Neither reading is a validity test: a link the `URL` constructor cannot read is imported all the
 * same, as it always has been, and simply has no host to show. */
const entryOf = (title, link, at) => ({
  title: clampTitle(title),
  link,
  ...normaliseUrl(link),
  /** Its position in the file, which is the only stable key an entry has — two lines can be
   *  identical, and often are in an export taken twice. */
  at,
});

/** `title;url` per line.
 *
 *  ⚠️ **A line with no `;` is skipped rather than fatal.** The controller destructured every line and
 *  called `.trim()` on the second half, so the empty string `split("\n")` leaves after a trailing
 *  newline threw a `TypeError` — a 500, after the rows before it had already been inserted. Nearly
 *  every csv ends with a newline, so nearly every csv import failed that way. */
function parseCsv(text) {
  const entries = [];
  let malformed = 0;

  text.split("\n").forEach((line, at) => {
    if (line.trim() === "") return;

    const [title, link] = line.split(";");
    if (!title?.trim() || !link?.trim() || isOverLong(link.trim())) {
      malformed += 1;
      return;
    }

    entries.push(entryOf(title.trim(), link.trim(), at));
  });

  return { entries, malformed };
}

/** The Session Buddy export: a session name, a blank line, then pairs of `title` / `url` separated
 *  by blank lines.
 *
 *  The loop is the legacy controller's, step for step — including the `splice(0, 2)` that drops the
 *  name line and the blank under it, and the look-ahead that eats the separator. `title && link`
 *  tests the raw strings, as it did there: a line of spaces is truthy, and tightening it here would
 *  change what a file imports, which is not this ticket's business.
 *
 *  Blank lines are not malformed — they are the separator the format is built on. One half of a pair
 *  on its own is: a truncated export, or a title whose url is missing. */
function parseSessionBuddy(text) {
  const lines = text.split("\n");
  lines.splice(0, 2);

  const entries = [];
  let malformed = 0;

  for (let i = 0; i < lines.length; i += 2) {
    const title = lines[i];
    const link = lines[i + 1];

    if (title && link) {
      if (isOverLong(link.trim())) {
        malformed += 1;
      } else {
        entries.push(entryOf(title.trim(), link.trim(), i));
      }
    } else if ((title ?? "").trim() !== "" || (link ?? "").trim() !== "") {
      malformed += 1;
    }

    if (lines[i + 2] === "") i += 1;
  }

  return { entries, malformed };
}

/** The file, as both endpoints read it: `{ entries, malformed }`, where an entry is
 *  `{ title, link, normalised, host, at }`. */
function parseImportFile(filename, text) {
  return isCsv(filename) ? parseCsv(text) : parseSessionBuddy(text);
}

module.exports = { isCsv, parseImportFile };
