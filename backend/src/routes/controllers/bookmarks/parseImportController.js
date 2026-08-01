const dbConnection = require("../../../db/dbinitmysql");
const { markImportDuplicates } = require("./helpers/markImportDuplicates");
const { parseImportFile } = require("./helpers/parseImportFile");

/** How many staged rows travel back. The table draws a sample of a long file and says so — the
 *  summary underneath carries the totals, and `parsed` minus the number of rows returned is the
 *  `N more not listed` the screen already prints. Two hundred rows is ~30 kb of JSON; the whole of a
 *  five-thousand-line export would be half a megabyte, none of which would be drawn. */
const PREVIEW_ROWS = 200;

/* `POST /bookmarks/import/parse` — what is in the file, without writing anything (COS-307).
 *
 * The staging step the handoff draws: a file is read, its entries are listed with the state of each
 * against the index, and nothing is inserted until `POST /bookmarks/import` is called with the same
 * file. It is the endpoint UI 07 was missing, and the reason that screen had to grow a parser of its
 * own — `parseImportFile` is now the only one, and it is shared with the commit below.
 *
 * ⚠️ **`state` is real here, where the screen had it hard-coded.** Every row read `NEW` and the
 * summary read `0 duplicate`, because nothing looked: that mock is this endpoint. What "duplicate"
 * means, and the limit assumed in defining it, is written on `markImportDuplicates`.
 *
 * **Nothing is remembered between this call and the commit.** There is no staging table and no
 * server-side draft: the commit takes the same file again and parses it again, which is what makes
 * the two agree without either of them holding state. See `commitImportController` for why that is
 * the shape rather than posting the retained entries back.
 */
module.exports = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "no file" });
  }

  const { entries, malformed } = parseImportFile(req.file.originalname, req.file.buffer.toString());

  const conn = await dbConnection();

  try {
    const marked = await markImportDuplicates(conn, req.user.id, entries);

    return res.status(200).json({
      entries: marked.entries.slice(0, PREVIEW_ROWS),
      summary: {
        parsed: entries.length,
        new: marked.fresh,
        duplicates: marked.duplicates,
        malformed,
      },
    });
  } catch (e) {
    return res.status(500).json({ msg: "error parsing import : " + e });
  } finally {
    await conn.end();
  }
};
