const { format } = require("date-fns");
const dbConnection = require("../../../db/dbinitmysql");
const jimpHelper = require("./helpers/jimpHelper");
const generateHexColor = require("./helpers/generateHexColor");

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

  let urlID = null;
  if (url) {
    const sqlUrl = "INSERT INTO url (original) VALUES (?);";
    try {
      const result = await conn.execute(sqlUrl, [url]);
      urlID = result[0].insertId;
    } catch (err) {
      await conn.end();
      return res.status(500).json({ msg: "error creating url : " + err });
    }
  }

  /* Prepared, not interpolated (COS-295). `title`, `notes`, `priority` and `url` above are
   * the client's own text, and the empty-string checks that used to decide whether to wrap a
   * value in quotes now decide whether the value is `null` — which is what they always meant. */
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
      title,
      priority !== "" ? priority : null,
      notes !== undefined ? notes : null,
      Number(stars),
      screenshotFilename !== null ? String(screenshotFilename) : null,
      format(new Date(), "yyyy-MM-dd"),
    ]);
    bookmarkID = bookmarkResult[0].insertId;
  } catch (err) {
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
