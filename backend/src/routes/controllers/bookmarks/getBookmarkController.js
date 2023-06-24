const dbConnection = require("../../../db/dbinitmysql");
const marshallCategories = require("./helpers/marshallCategories");

module.exports = async (req, res) => {
  const getSingleBookmarkSQL = `
      SELECT b.*, u.original AS original_url, GROUP_CONCAT(c.name) AS categories_names, GROUP_CONCAT(c.color) AS categories_colors
      FROM bookmark b
      LEFT JOIN url u ON b.url_id = u.id
      LEFT JOIN bookmark_category bc ON b.id = bc.bookmark_id
      LEFT JOIN category c ON bc.category_id = c.id
      WHERE b.id = ${req.params.id};
  `;

  const conn = await dbConnection();
  const [bookmark] = await conn.execute(getSingleBookmarkSQL);
  await conn.end();

  const marshalledRows = marshallCategories(bookmark);

  console.log("marshalledRows", marshalledRows);

  res.json(marshalledRows);
}
