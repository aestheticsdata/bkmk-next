const { format } = require("date-fns");
const dbConnection = require("../../../db/dbinitmysql");
const { normaliseUrl } = require("../../../helpers/normaliseUrl");
const jimpHelper = require("./helpers/jimpHelper");
const generateHexColor = require("./helpers/generateHexColor");
const { storedText } = require("./helpers/storedText");

module.exports = async (req, res) => {
  const { title, url, categories: categoriesString, notes, stars, priority, reminder, group } = req.body;

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

  /* ⚠️ **A category id is a claim, and the foreign key does not check it** (COS-345).
   *
   * `bookmark_category` only asks that the category *exist*, never that it be yours — so an id typed
   * into this payload attached another account's category to a record here, and the read side then
   * concatenated that account's name and colour beside it. The neighbouring branch below, the one that
   * creates a category from a name, has always carried `user_id`; this is the branch that did not.
   *
   * **The check runs before the first `INSERT`, not beside the link it guards.** This controller has
   * no transaction — that is COS-353 — so a refusal raised down at `bookmark_category` would answer
   * 404 and still leave an alarm, a url and a record behind it. Asked here, a refusal writes nothing
   * at all, and it costs one `SELECT` per named category on a path that already runs several.
   *
   * `if (!category.id)` is the same test the loop below sorts the two branches on, deliberately: the
   * ids checked here are exactly the ids that will be linked, and a falsy one is a creation. */
  for (const category of categories) {
    if (!category.id) continue;

    const [[owned]] = await conn.execute("SELECT id FROM category WHERE id=? AND user_id=? LIMIT 1", [
      category.id,
      userID,
    ]);

    if (!owned) {
      await conn.end();
      return res.status(404).json({ msg: "category not found" });
    }
  }

  let alarmID = null;
  if (reminder) {
    const sqlAlarm = `
      INSERT INTO alarm (frequency, date_added) VALUES (?, ?);
    `;

    try {
      const result = await conn.execute(sqlAlarm, [reminder, format(new Date(), "yyyy-MM-dd")]);
      alarmID = result[0].insertId;
    } catch (err) {
      await conn.end();
      return res.status(500).json({ msg: "error creating alarm : " + err });
    }
  }

  if (group) {
  }

  /* The link as it was typed, plus the key it is compared on and the host it is filed under
   * (COS-338). All three are written here rather than derived later, so that a row created by this
   * controller and a row created by the import answer the same question the same way. */
  let urlID = null;
  if (url) {
    const sqlUrl = "INSERT INTO url (original, normalised, host) VALUES (?, ?, ?);";
    const { normalised, host } = normaliseUrl(url);
    try {
      const result = await conn.execute(sqlUrl, [url, normalised, host]);
      urlID = result[0].insertId;
    } catch (err) {
      await conn.end();
      return res.status(500).json({ msg: "error creating url : " + err });
    }
  }

  /* Prepared, not interpolated (COS-295). `title`, `notes`, `priority` and `url` above are
   * the client's own text, and the empty-string checks that used to decide whether to wrap a
   * value in quotes now decide whether the value is `null` — which is what they always meant.
   *
   * The two text columns go through `storedText` (COS-334), which is one `replaceAll` and a long
   * comment: `multipart/form-data` turns every newline in a field into `CRLF`, and this is where that
   * is undone. Nothing encodes them any more, which is the change that made it visible. */
  const sqlBookmark = `
    INSERT INTO bookmark (url_id, user_id, alarm_id, title, priority, notes, stars, screenshot, date_added)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  let bookmarkID;
  try {
    const bookmarkResult = await conn.execute(sqlBookmark, [
      urlID,
      userID,
      alarmID,
      storedText(title),
      priority !== "" ? priority : null,
      notes !== undefined ? storedText(notes) : null,
      Number(stars),
      screenshotFilename !== null ? String(screenshotFilename) : null,
      format(new Date(), "yyyy-MM-dd"),
    ]);
    bookmarkID = bookmarkResult[0].insertId;
  } catch (err) {
    /* The url row went in first and nothing points at it now — take it back out (COS-338). There is
     * no transaction here to roll back, and this is the shape of failure that left the dev index
     * with 2 685 url rows reachable from no bookmark, which the migration has just swept. Sweeping
     * them while leaving the tap open would be a cleanup with a date on it. */
    if (urlID !== null) {
      await conn.execute("DELETE FROM url WHERE id=?", [urlID]).catch(() => {});
    }
    await conn.end();
    return res.status(500).json({ msg: "error creating bookmark : " + err });
  }

  if (categories.length > 0) {
    const sqlCategories = `
      INSERT INTO category (name, color, user_id)
      VALUES (?, ?, ?);
    `;
    const categoriesID = [];
    for (const category of categories) {
      if (!category.id) {
        try {
          const result = await conn.execute(sqlCategories, [category.label, generateHexColor(), userID]);
          categoriesID.push(result[0].insertId);
        } catch (err) {
          await conn.end();
          return res.status(500).json({ msg: "error creating new category : " + err });
        }
      } else {
        categoriesID.push(category.id);
      }
    }

    const sqlBookmarkCategory = `
      INSERT INTO bookmark_category (bookmark_id, category_id)
      VALUES (?, ?);
    `;

    for (const categoryID of categoriesID) {
      try {
        await conn.execute(sqlBookmarkCategory, [bookmarkID, categoryID]);
      } catch (err) {
        await conn.end();
        return res.status(500).json({ msg: "error creating new bookmark_category : " + err });
      }
    }
  }
  await conn.end();
  return res.status(200).json({ msg: "bookmark created" });
};
