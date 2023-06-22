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

  // const cat = JSON.parse(categories)
  const userID = req.decoded.id; // from jwt token middleware

  // console.log("cat[0].name", cat[0].name);
  console.log("req.body", req.body);

  const screenshotFilename = await jimpHelper({
    file: req.file,
    title,
    userID,
  });

  console.log("screenshotFilename", screenshotFilename);

  if (reminder) {

  }

  if (group) {

  }



  const conn = await dbConnection();

  let urlID = null;

  if (url) {
    const sqlUrl = `INSERT INTO url (original) VALUES ("${url}");`;
    try {
      const result = await conn.execute(sqlUrl);
      urlID = result[0].insertId;
    } catch (err) {
      res.status(500).json({msg: "error creating bookmark"})
      conn.end();
    }
  }

  const sqlBookmark = `
    INSERT INTO bookmark (url_id, user_id, title, stars, screenshot, date_added)
    VALUES (${urlID}, ${userID}, "${title}", ${Number(stars)}, "${screenshotFilename}", "${format(new Date(), 'yyyy-MM-dd')}");
  `;

  try {
    await conn.execute(sqlBookmark);
    res.status(200).json({ msg: "bookmark created" });
  } catch (err) {
    res.status(500).json({ msg: "error creating bookmark : " + err });
  } finally {
    conn.end();
  }
};
