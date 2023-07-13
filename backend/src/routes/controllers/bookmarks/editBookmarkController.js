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
  // si il y a deja une url
  if (originalBookmark.url_id) {
    try {
      const result = await conn.execute(`SELECT * FROM url WHERE id=${originalBookmark.url_id}`);
      originalURL = result[0][0];
    } catch (e) {
      return res.status(500).json({ msg: "error getting url : ", e });
    }

    // si il y a une url dans la requete, alors écraser celle existante
    if (req.body.url) {
      try {
        await conn.execute(`UPDATE url SET original="${req.body.url}" WHERE id=${originalURL.id}`);
      } catch (e) {
        return res.status(500).json({ msg: "error updating url : ", e });
      }
    // sinon supprimer l'url et mettre à null url_id dans bookmark
    } else {
      try {
        await conn.execute(`DELETE FROM url WHERE id=${originalURL.id}`);
        await conn.execute(`UPDATE bookmark SET url_id=NULL WHERE id=${originalBookmark.id}`);
      } catch (e) {
        return res.status(500).json({ msg: "error deleting url : ", e });
      }
    }
  // il n'y pas encore d'url existante
  } else {
    // il y a une url à créer
    if (req.body.url) {
      try {
        const result = await conn.execute(`INSERT INTO url (original) VALUES ("${req.body.url}")`);
        const newURL_ID = result[0].insertId;
        try {
          await conn.execute(`UPDATE bookmark SET url_id=${newURL_ID}`);
        } catch (e) {
          return res.status(500).json({ msg: "error updating bookmark url : ", e });
        }
      } catch (e) {
        return res.status(500).json({ msg: "error creating url : ", e });
      }
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