const dbConnection = require('../../../db/dbinitmysql');
const fs = require("fs");
const { format } = require('date-fns');
// const jimp = require('jimp');
const jimpHelper = require("./helpers/jimpHelper");


module.exports = async (req, res) => {
  const {
    title,
    url,
    categories,
    notes,
    stars,
    priority,
    reminder,
    // screenshot,
    group,
  } = req.body;

  console.log("create bookmark");
  console.log("title", title);
  console.log("req.file", req.file);

  const cat = JSON.parse(categories)
  const userID = req.decoded.id; // from jwt token middleware

  console.log("cat[0].name", cat[0].name);
  console.log("req.body", req.body);

  const screenshotFilename = await jimpHelper({
    file: req.file,
    title,
    userID,
  });

  console.log("screenshotFilename", screenshotFilename);

  /*
  * const sqlCreateSpending = `
      INSERT INTO Spendings (ID, userID, date, label, amount, categoryID, currency, itemType)
      VALUES ("${uuidv1()}", "${userID}", "${date}", "${label}", "${amount}", "${newCategoryID ?? (existingCategory?.ID ?? category?.ID)}", "${currency}", "spending");
    `;
  * */

  let urlID = null;

  if (url) {
    const sqlUrl = `INSERT INTO url (original) VALUES ("${url}");`;
    dbConnection.query(
      sqlUrl,
      (err, result) => {
        if (err) {
          res.status(500).json({ msg: "error creating url entry" });
        }
        urlID = result.insertId;
      }
    );
  }

  if (reminder) {

  }

  if (group) {

  }

  const sqlBookmark = `
    INSERT INTO bookmark (url_id, user_id, title, screenshot, date_added)
    VALUES (${urlID}, ${userID}, "${title}", "${screenshotFilename}", "${format(new Date(), 'yyyy-MM-dd')}");
  `;

  console.log("sqlBookmark", sqlBookmark);

  dbConnection.query(
    sqlBookmark,
    (err) => {
      if (err) {
        res.status(500).json({ msg: "error creating bookmark : " + err });
      } else {
        res.status(200).json({ msg: "bookmark created" });
      }
    }
  )
};
