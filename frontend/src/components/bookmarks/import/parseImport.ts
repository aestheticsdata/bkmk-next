/* The import file, read in the browser (COS-303).
 *
 * ⚠️ **This is a second implementation of `uploadBookmarksController`'s parser, and it is
 * deliberate and temporary.** The screen has to show what is in the file *before* the file is sent,
 * and there is no endpoint that parses without writing — DATA 02 (COS-307) is that endpoint. Until
 * it exists the choice is between a staging table that reads the real file and one that shows five
 * invented bookmarks, and only one of those is worth putting on screen.
 *
 * So this mirrors the backend line for line, on purpose, including the shape of its loop: the point
 * is that the preview predicts the import. Where it deliberately differs is in what it does with a
 * line it cannot read — the backend has no notion of a malformed line, and this counts them, because
 * the handoff's summary has a number for them.
 *
 * **COS-307 deletes this file** and the front reads the parse off the wire instead. Until then, a
 * change to either parser has to be made in both. */

/** One entry, as both parsers produce it. Deliberately the shape of `ImportEntrySchema`, which is
 *  what the parse endpoint will answer with. */
type ImportEntry = { title: string; link: string };

/** A staged entry: an import entry, plus what the table draws beside it. */
type StagedEntry = ImportEntry & {
  /** The link's host, or `null` when the link is not a url the browser can parse. */
  host: string | null;
  /** Its position in the file, which is the only stable key an entry has — two lines can be
   *  identical, and often are in an export taken twice. */
  at: number;
};

type ParseResult = {
  entries: StagedEntry[];
  /** Lines that carried something but did not yield a title and a link. Blank lines are not
   *  malformed — they are the separator the `.txt` format is built on. */
  malformed: number;
};

/** Which parser to run.
 *
 *  ⚠️ **The last dot segment, not the second.** The backend read `originalname.split(".")[1]`, so
 *  `session_buddy.2026_07_11.csv` answered `"2026_07_11"` and went down the `.txt` path — a csv
 *  silently parsed as pairs of lines. Fixed on both sides in this ticket; this is the half that
 *  decides what the preview shows. */
const isCsv = (filename: string): boolean => filename.toLowerCase().split(".").pop() === "csv";

/** The host, for the table's middle column. A link that is not a url is still imported by the
 *  backend, so it is not malformed — it simply has nothing to show here. */
function hostOf(link: string): string | null {
  try {
    return new URL(link).host;
  } catch {
    return null;
  }
}

/** `title;url` per line.
 *
 *  ⚠️ **A line with no `;` is skipped rather than fatal.** The backend destructured every line and
 *  called `.trim()` on the second half, so the empty string that `split("\n")` leaves after a
 *  trailing newline threw a `TypeError` — which `catchAsync` turned into a 500. Nearly every csv
 *  ends with a newline, so nearly every csv import failed. Fixed on both sides in this ticket. */
function parseCsv(text: string): ParseResult {
  const entries: StagedEntry[] = [];
  let malformed = 0;

  text.split("\n").forEach((line, at) => {
    if (line.trim() === "") return;
    const [title, link] = line.split(";");
    if (!title?.trim() || !link?.trim()) {
      malformed += 1;
      return;
    }
    entries.push({ title: title.trim(), link: link.trim(), host: hostOf(link.trim()), at });
  });

  return { entries, malformed };
}

/** The Session Buddy export: a session name, a blank line, then pairs of `title` / `url` separated
 *  by blank lines.
 *
 *  The loop is the backend's, kept step for step so the two agree on the count — including the
 *  `splice(0, 2)` that drops the name line and the blank under it, and the look-ahead that eats the
 *  separator. `title && link` tests the raw strings, as it does there: a line of spaces is truthy,
 *  and changing that here would make the preview disagree with the import. */
function parseSessionBuddy(text: string): ParseResult {
  const lines = text.split("\n");
  lines.splice(0, 2);

  const entries: StagedEntry[] = [];
  let malformed = 0;

  for (let i = 0; i < lines.length; i += 2) {
    const title = lines[i];
    const link = lines[i + 1];

    if (title && link) {
      entries.push({ title: title.trim(), link: link.trim(), host: hostOf(link.trim()), at: i });
    } else if ((title ?? "").trim() !== "" || (link ?? "").trim() !== "") {
      // One half of a pair, on its own: a truncated export, or a title whose url is missing.
      malformed += 1;
    }

    if (lines[i + 2] === "") i += 1;
  }

  return { entries, malformed };
}

function parseImportFile(filename: string, text: string): ParseResult {
  return isCsv(filename) ? parseCsv(text) : parseSessionBuddy(text);
}

export { isCsv, parseImportFile };

export type { ImportEntry, ParseResult, StagedEntry };
