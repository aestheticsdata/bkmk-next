const { format } = require("date-fns");
const dbConnection = require("../../../db/dbinitmysql");
const { httpError } = require("../../../helpers/httpError");
const { normaliseUrl } = require("../../../helpers/normaliseUrl");
const jimpHelper = require("./helpers/jimpHelper");
const generateHexColor = require("./helpers/generateHexColor");
const { storedText } = require("./helpers/storedText");

const today = () => format(new Date(), "yyyy-MM-dd");

/** The categories the record should be linked to, created where they do not exist yet.
 *
 * ⚠️ **A category id is a claim, and the foreign key does not check it** (COS-345).
 * `bookmark_category` only asks that the category *exist*, never that it be yours — so an id typed
 * into this payload attached another account's category to a record here, and the read side then
 * concatenated that account's name and colour beside it. The branch that creates a category from a
 * name has always carried `user_id`; this is the branch that did not.
 *
 * **The check has moved back beside the link it guards**, which is where COS-345 wanted it. It ran
 * up front, before the first `INSERT`, for one reason its own comment gave: without a transaction, a
 * refusal raised down here would answer 404 and still leave an alarm, a url and a record behind it.
 * That reason is what COS-353 removed — a throw now takes all three back — so the id is checked in
 * the loop that links it rather than in a pass ahead of it.
 *
 * `if (category.id)` sorts the two branches, deliberately: the ids checked here are exactly the ids
 * that will be linked, and a falsy one is a creation. */
const applyCategories = async (conn, bookmarkID, userID, categories) => {
  const categoryIDs = [];

  for (const category of categories) {
    if (category.id) {
      const [[owned]] = await conn.execute("SELECT id FROM category WHERE id=? AND user_id=? LIMIT 1", [
        category.id,
        userID,
      ]);

      if (!owned) throw httpError(404, "category not found");

      categoryIDs.push(category.id);
      continue;
    }

    const [created] = await conn.execute("INSERT INTO category (name, color, user_id) VALUES (?, ?, ?)", [
      category.label,
      generateHexColor(),
      userID,
    ]);
    categoryIDs.push(created.insertId);
  }

  for (const categoryID of categoryIDs) {
    await conn.execute("INSERT INTO bookmark_category (bookmark_id, category_id) VALUES (?, ?)", [
      bookmarkID,
      categoryID,
    ]);
  }
};

/* `POST /bookmarks` — creating a record (COS-353).
 *
 * **One transaction, where there was none.** This was the last write controller still in the old
 * shape: five tables, `autocommit=1`, a `try/catch` around each statement and its own `conn.end()`
 * in every error path — so each `return res.status(500)` left in the database everything written
 * above it. It now has the shape `editBookmarkController` and `commitImportController` already had,
 * one `try` with `beginTransaction` / `commit` / `rollback` and a single `conn.end()` in a `finally`.
 *
 * ⚠️ **The half that mattered was not the one the ticket was opened for.** COS-338 named the orphan
 * `alarm` this path could leave — a row inserted before the bookmark that points at it — and it is
 * real but rare: twelve alarms in three years, none orphaned. What the measurement found instead is
 * that **the category loop ran after the bookmark was committed**, so a failure in it answered 500
 * while leaving the record created and visible in the index, its categories half posted. The caller
 * read "error", the index showed the card.
 *
 * That failure is reachable from the client and it is the one this was verified against:
 * `bookmark_category` carries `UNIQUE KEY uc_bookmark_category (bookmark_id, category_id)` and
 * nothing de-duplicates the list — neither `categoriesJSONSchema` nor this controller — so posting
 * the same existing category twice passes validation and breaks on `ER_DUP_ENTRY` half way through.
 * It still answers 500, deliberately: what changed is that it now leaves nothing behind.
 *
 * **What the transaction replaces.** The `DELETE FROM url` that COS-338 put in the bookmark insert's
 * `catch` is gone — it was a rollback written by hand for one row out of five, and the real one
 * covers it. The five `conn.end()` of the error paths went with it.
 *
 * ⚠️ **The screenshot stays outside the transaction, and that is deliberate.**
 * `jimpHelper.createScreenshot` writes to disk before the connection is even opened, so a rollback
 * leaves an orphan file. It is the arbitration already written in `editBookmarkController` — an
 * orphan file is a cheaper wrong than a row naming a file that is not there — and it holds here too.
 *
 * **`if (group) {}` is gone**: an empty block reading a field the create screen stopped sending with
 * COS-302, which was never written to `bookmark.group_id` in the first place. */
module.exports = async (req, res) => {
  const { title, url, categories: categoriesString, notes, stars, priority, reminder } = req.body;

  const categories = JSON.parse(categoriesString);

  const userID = req.user.id; // from sessionAuthMiddleware

  let screenshotFilename = null;
  if (req.file) {
    screenshotFilename = await jimpHelper.createScreenshot({
      file: req.file,
      userID,
    });
  }

  const conn = await dbConnection();

  try {
    await conn.beginTransaction();

    let alarmID = null;
    if (reminder) {
      const [alarm] = await conn.execute("INSERT INTO alarm (frequency, date_added) VALUES (?, ?)", [
        reminder,
        today(),
      ]);
      alarmID = alarm.insertId;
    }

    /* The link as it was typed, plus the key it is compared on and the host it is filed under
     * (COS-338). All three are written here rather than derived later, so that a row created by this
     * controller and a row created by the import answer the same question the same way. */
    let urlID = null;
    if (url) {
      const { normalised, host } = normaliseUrl(url);
      const [inserted] = await conn.execute("INSERT INTO url (original, normalised, host) VALUES (?, ?, ?)", [
        url,
        normalised,
        host,
      ]);
      urlID = inserted.insertId;
    }

    /* Prepared, not interpolated (COS-295). `title`, `notes`, `priority` and `url` above are
     * the client's own text, and the empty-string checks that used to decide whether to wrap a
     * value in quotes now decide whether the value is `null` — which is what they always meant.
     *
     * The two text columns go through `storedText` (COS-334), which is one `replaceAll` and a long
     * comment: `multipart/form-data` turns every newline in a field into `CRLF`, and this is where
     * that is undone. Nothing encodes them any more, which is the change that made it visible. */
    const [bookmark] = await conn.execute(
      `INSERT INTO bookmark (url_id, user_id, alarm_id, title, priority, notes, stars, screenshot, date_added)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        urlID,
        userID,
        alarmID,
        storedText(title),
        priority !== "" ? priority : null,
        notes !== undefined ? storedText(notes) : null,
        Number(stars),
        screenshotFilename !== null ? String(screenshotFilename) : null,
        today(),
      ],
    );

    await applyCategories(conn, bookmark.insertId, userID, categories);

    await conn.commit();
    return res.status(200).json({ msg: "bookmark created" });
  } catch (e) {
    await conn.rollback().catch(() => {});

    /* A refused category is a 404, and the rollback above it is the point (COS-345). `status` is
     * only ever set by `httpError`; anything else here is an accident and answers 500. */
    if (e.status) {
      return res.status(e.status).json({ msg: e.message });
    }

    return res.status(500).json({ msg: "error creating bookmark : " + e });
  } finally {
    await conn.end();
  }
};
