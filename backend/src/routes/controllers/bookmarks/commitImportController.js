const { format } = require("date-fns");
const dbConnection = require("../../../db/dbinitmysql");
const generateHexColor = require("./helpers/generateHexColor");
const { markImportDuplicates, STATES } = require("./helpers/markImportDuplicates");
const { parseImportFile } = require("./helpers/parseImportFile");

/** The tag `tag as imported` applies. A word rather than a date so that a second import joins the
 *  first: the option means "let me find these again", and `imported · 2026-08-01` would spread that
 *  across as many tags as there are import days. Twenty characters is `category.name`. */
const IMPORTED_TAG = "imported";

/** `import_run.filename` is `VARCHAR(255)`; a longer name is cut rather than refused, since it is
 *  shown and nothing is looked up by it. */
const FILENAME_COLUMN = 255;

const today = () => format(new Date(), "yyyy-MM-dd");

/** The account's `imported` tag, created on first use. Looked up by name — the picker and the edit
 *  form both do the same, and the alternative is a second category with the same name and a
 *  different colour on every import. */
const importedTagId = async (conn, userID) => {
  const [[existing]] = await conn.execute("SELECT id FROM category WHERE user_id=? AND name=? LIMIT 1", [
    userID,
    IMPORTED_TAG,
  ]);
  if (existing) return Number(existing.id);

  const [created] = await conn.execute("INSERT INTO category (name, color, user_id) VALUES (?, ?, ?)", [
    IMPORTED_TAG,
    generateHexColor(),
    userID,
  ]);
  return Number(created.insertId);
};

/* `POST /bookmarks/import` — the commit (COS-307).
 *
 * The second half of the staging the handoff draws: `POST /bookmarks/import/parse` says what is in
 * the file, this writes it. It replaces `POST /bookmarks/upload`, which read a file and inserted
 * every line of it with no preview, no options and no report.
 *
 * ⚠️ **The file is sent again rather than the entries being posted back.** The ticket describes a
 * commit "taking the retained entries", and this takes the file plus the options that decide which
 * entries are retained — which is the same set, for two reasons. The screen has no per-row
 * selection: what is retained is "everything the parse found, minus the duplicates if that option is
 * on", so the options *are* the selection. And posting the entries back would mean a JSON body of a
 * few hundred kilobytes on a large export, against `express.json()`'s 100 kb default — raising that
 * limit application-wide to carry data the server just produced, and would have to re-check anyway
 * because a client's `state` cannot be trusted. Parsing is deterministic, so the second read of the
 * same file yields the same entries the preview showed.
 *
 * ⚠️ **One transaction, where there was none.** The legacy controller returned a 500 on the first
 * row that failed, having already inserted every row before it and with no way to tell which. A
 * partial import is the worst outcome here: it cannot be replayed without creating duplicates of the
 * half that landed. Either the whole file is in the index or none of it is.
 *
 * ⚠️ **The title is stored as it reads in the file.** The legacy controller wrote
 * `encodeURIComponent(anyASCII(title))`, which is why an imported title displayed as
 * `Framework%20reimagined` until something decoded it, and why searching the index missed imported
 * rows the moment the query contained a space — `getBookmarksController` compared the decoded input
 * against that encoded column. The GRAPHITE create screen has stored the raw title since COS-302, so
 * this aligned the two write paths on the one that works. ✅ **The rows already in the database were
 * the other half, and DATA 07 (COS-334) has done them**: `2026-08-01-decode-text.js` decoded 1 177
 * values, and this controller's output is now indistinguishable from what is in the column.
 *
 * ⚠️ **What it does not undo is `anyASCII`.** The legacy import stripped accents before encoding, so
 * `Café` was already `Cafe` in the file that reached the column — a loss with nothing left to read it
 * back from. The decode gives the spaces and the punctuation back and cannot give those back, which
 * is why COS-334 is careful not to be described as repairing the text.
 *
 * **`capture shots` is not an option here.** Nothing captures a screenshot from a url anywhere in
 * this application — the only path to the `screenshot` column is a file the account uploads. The
 * switch stays drawn and disabled on the screen, and the ticket that builds the capture is COS-329.
 */
module.exports = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "no file" });
  }

  const { skipDuplicates, tagAsImported } = req.validated.body;
  const userID = req.user.id;
  const { entries, malformed } = parseImportFile(req.file.originalname, req.file.buffer.toString());

  const conn = await dbConnection();

  try {
    const marked = await markImportDuplicates(conn, userID, entries);

    await conn.beginTransaction();

    const tagId = tagAsImported ? await importedTagId(conn, userID) : null;

    let imported = 0;
    let skipped = 0;

    for (const entry of marked.entries) {
      if (skipDuplicates && entry.state === STATES.duplicate) {
        skipped += 1;
        continue;
      }

      /* The link as the file gave it, beside the key it is compared on and its host (COS-338). The
       * parse already computed both — `markImportDuplicates` asked it the duplicate question with
       * them — so the row is written from what the entry carries rather than parsed a second time. */
      const [url] = await conn.execute("INSERT INTO url (original, normalised, host) VALUES (?, ?, ?)", [
        entry.link,
        entry.normalised,
        entry.host,
      ]);
      const [bookmark] = await conn.execute(
        "INSERT INTO bookmark (title, user_id, url_id, date_added) VALUES (?, ?, ?, ?)",
        [entry.title, userID, url.insertId, today()],
      );

      if (tagId !== null) {
        await conn.execute("INSERT INTO bookmark_category (bookmark_id, category_id) VALUES (?, ?)", [
          bookmark.insertId,
          tagId,
        ]);
      }

      imported += 1;
    }

    /* The run is recorded inside the transaction, so `last import` cannot describe an import that
     * rolled back — the line in the right pane is read from this table and nothing else. */
    await conn.execute(
      "INSERT INTO import_run (user_id, filename, entries, skipped, ran_at) VALUES (?, ?, ?, ?, NOW())",
      [userID, req.file.originalname.slice(0, FILENAME_COLUMN), imported, skipped],
    );

    await conn.commit();

    return res.status(200).json({ msg: "import committed", parsed: entries.length, imported, skipped, malformed });
  } catch (e) {
    await conn.rollback().catch(() => {});
    return res.status(500).json({ msg: "error committing import : " + e });
  } finally {
    await conn.end();
  }
};
