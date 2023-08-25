const { format } = require("date-fns");
const anyASCII = require("../../../helpers/anyascii");
const dbConnection = require("../../../db/dbinitmysql");


module.exports = async (req, res) => {
  const userID = req.decoded.id; // from jwt token middleware
  const buffer = Buffer.from(req.file.buffer);
  const arr = buffer.toString().split("\n");
  arr.splice(0,2);

  const entries = [];
  for (let i = 0; i < arr.length; i += 2) {
    const title = arr[i];
    const link = arr[i+1];
    if (title && link) {
      entries.push({title: title.trim(), link: link.trim()});
    }
    if (arr[i+2] === "") {
      i++;
    }
  }

  const conn = await dbConnection();

  for (const bookmark of entries) {
    let urlID = null;
    const sqlUrl = `INSERT INTO url (original) VALUES ("${bookmark.link}");`;
    try {
      const result = await conn.execute(sqlUrl);
      urlID = result[0].insertId;
    } catch (err) {
      conn.end();
      return res.status(500).json({msg: "error creating url : " + err, url: bookmark.link});
    }

    let bookmarkTitle = bookmark.title.length > 120 ? bookmark.title.substring(0, 119) : bookmark.title;
    try {
      await conn.execute(`
        INSERT INTO bookmark (title, user_id, url_id, date_added)
        VALUES ("${encodeURIComponent(anyASCII(bookmarkTitle))}", ${userID}, ${urlID}, "${format(new Date(), 'yyyy-MM-dd')}"); 
      `);
    } catch (e) {
      return res.status(500).json({ msg: "error creating bookmark : " + e, title: bookmarkTitle });
    }
  }

  console.log("entries : ", entries)
  res.status(200).json({ msg: "bookmarks upload success" });
}
