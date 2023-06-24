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
    // screenshot,
    group,
  } = req.body;

  const categories = JSON.parse(categoriesString);

  console.log("create bookmark");
  console.log("title", title);
  console.log("req.file", req.file);

  // const cat = JSON.parse(categories)
  const userID = req.decoded.id; // from jwt token middleware

  // console.log("cat[0].name", cat[0].name);
  console.log("req.body", req.body);

  let screenshotFilename = null;
  if (req.file) {
    screenshotFilename = await jimpHelper({
      file: req.file,
      title,
      userID,
    });
  }

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
      conn.end();
      return res.status(500).json({msg: "error creating url : " + err});
    }
  }

  const sqlBookmark = `
    INSERT INTO bookmark (url_id, user_id, title, stars, screenshot, date_added)
    VALUES (${urlID}, ${userID}, "${title}", ${Number(stars)}, ${typeof screenshotFilename !== 'undefined' ? `"${String(screenshotFilename)}"` : null}, "${format(new Date(), 'yyyy-MM-dd')}");
  `;

  let bookmarkID;
  try {
    const bookmarkResult = await conn.execute(sqlBookmark);
    bookmarkID = bookmarkResult[0].insertId;
    // res.status(200).json({ msg: "bookmark created" });
  } catch (err) {
    conn.end();
    return res.status(500).json({ msg: "error creating bookmark : " + err });
  }

  console.log("categories", categories);
  if (categories.length > 0) {
    const sqlCategories = (name, color) => `
      INSERT INTO category (name, color, user_id)
      VALUES ("${name}", "${color}", ${userID});
    `;
    const categoriesID = [];
    for (const category of categories) {
      console.log("category --- : ", category);
      if (!category.id) {
        console.log("la category n'a pas d'id");
        try {
          const sql = sqlCategories(category.label, generateHexColor());
          console.log("requete sql", sql);
          const result = await conn.execute(sql);
          categoriesID.push(result[0].insertId);
        } catch (err) {
          conn.end();
          return res.status(500).json({ msg: "error creating new category : " + err });
        }
      } else {
        console.log("la categorie exite deja");
        console.log("category", category);
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
