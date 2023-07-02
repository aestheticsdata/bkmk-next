const { format } = require('date-fns');
const dbConnection = require('../../../db/dbinitmysql');
const jimpHelper = require("./helpers/jimpHelper");
const generateHexColor = require("./helpers/generateHexColor");


module.exports = async (req, res) => {
  const {
    title,
    url,
    categories: categoriesString,
    notes,
    stars,
    priority,
    reminder,
    group,
  } = req.body;

  const categories = JSON.parse(categoriesString);

  const userID = req.decoded.id; // from jwt token middleware

  let screenshotFilename = null;
  if (req.file) {
    screenshotFilename = await jimpHelper({
      file: req.file,
      title,
      userID,
    });
  }

  const conn = await dbConnection();

  let alarmID = null;
  if (reminder) {
    const sqlAlarm = ` 
      INSERT INTO alarm (frequency, date_added) VALUES (${reminder}, "${format(new Date(), 'yyyy-MM-dd')}");
    `;

    try {
      const result = await conn.execute(sqlAlarm);
      alarmID = result[0].insertId;
    } catch (err) {
      return res.status(500).json({ msg: "error creating alarm : " + err });
    }
  }

  if (group) {

  }

  let urlID = null;
  if (url) {
    const sqlUrl = `INSERT INTO url (original) VALUES ("${url}");`;
    try {
      const result = await conn.execute(sqlUrl);
      urlID = result[0].insertId;
    } catch (err) {
      conn.end();
      return res.status(500).json({msg: "error creating url : " + err});
    }
  }

  const sqlBookmark = `
    INSERT INTO bookmark (url_id, user_id, alarm_id, title, priority, notes, stars, screenshot, date_added)
    VALUES (
      ${urlID},
      ${userID},
      ${alarmID},
      "${title}",
      ${priority !== "" ? `"${priority}"` : null},
      ${notes !== "" ? `"${notes}"` : null},
      ${Number(stars)},
      ${screenshotFilename !== null ? `"${String(screenshotFilename)}"` : null},
      "${format(new Date(), 'yyyy-MM-dd')}");
  `;

  let bookmarkID;
  try {
    const bookmarkResult = await conn.execute(sqlBookmark);
    bookmarkID = bookmarkResult[0].insertId;
  } catch (err) {
    conn.end();
    return res.status(500).json({ msg: "error creating bookmark : " + err });
  }

  if (categories.length > 0) {
    const sqlCategories = (name, color) => `
      INSERT INTO category (name, color, user_id)
      VALUES ("${name}", "${color}", ${userID});
    `;
    const categoriesID = [];
    for (const category of categories) {
      if (!category.id) {
        try {
          const sql = sqlCategories(category.label, generateHexColor());
          const result = await conn.execute(sql);
          categoriesID.push(result[0].insertId);
        } catch (err) {
          conn.end();
          return res.status(500).json({ msg: "error creating new category : " + err });
        }
      } else {
        categoriesID.push(category.id);
      }
    }

    const sqlBookmarkCategory = (bookmarkID, categoryID) => `
      INSERT INTO bookmark_category (bookmark_id, category_id)
      VALUES ("${bookmarkID}", "${categoryID}");
    `;

    for (const categoryID of categoriesID) {
      try {
        await conn.execute(sqlBookmarkCategory(bookmarkID, categoryID));
      } catch (err) {
        conn.end();
        return res.status(500).json({ msg: "error creating new bookmark_category : " + err });
      }
    }
  }

  return res.status(200).json({ msg: "bookmark created" });
};
