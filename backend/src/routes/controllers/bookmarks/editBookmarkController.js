const { format } = require('date-fns');
const dbConnection = require('../../../db/dbinitmysql');
const jimpHelper = require("./helpers/jimpHelper");

module.exports = async (req, res) => {
  console.log("bookmark edit", req.body);
  console.log("bookmark edit title", req.body.title);

  const conn = await dbConnection();

  const sqlBookmark = `SELECT * FROM bookmark WHERE id="${req.body.id}"`;
  let originalBookmark = null;
  try {
    const result = await conn.execute(sqlBookmark);
    originalBookmark = result[0][0];
  } catch (e) {
    return res.status(500).json({ msg: "error getting bookmark : ", e });
  }

  // title
  if (req.body.title !== originalBookmark.title) {
    try {
      await conn.execute(`UPDATE bookmark SET title="${req.body.title}" WHERE id="${originalBookmark.id}"`);
    } catch (e) {
      return res.status(500).json({ msg: "error updating title : ", e });
    }
  }

  // url
  let originalURL = null;
  try {
    const result = await conn.execute(`SELECT * FROM url WHERE id="${originalBookmark.url_id}"`);
    originalURL = result[0][0];
  } catch (e) {
    return res.status(500).json({ msg: "error getting url : ", e });
  }
  if (req.body.url !== originalURL.original) {
    try {
      await conn.execute(`UPDATE url SET original="${req.body.url}" WHERE id="${originalURL.id}"`);
    } catch (e) {
      return res.status(500).json({ msg: "error updating url : ", e });
    }
  }

  // notes
  try {
    await conn.execute(`UPDATE bookmark SET notes="${req.body.notes}" WHERE id="${originalBookmark.id}"`);
  } catch (e) {
    return res.status(500).json({ msg: "error updating notes : ", e });
  }

  conn.end();
  return res.status(200).json({ msg: "bookmark edited" });
}
