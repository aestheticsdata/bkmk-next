const dbConnection = require("../../../db/dbinitmysql");
const marshallCategories = require("./helpers/marshallCategories");

module.exports = async (req, res) => {
  const sql = `
    SELECT b.*, u.original AS original_url, GROUP_CONCAT(c.name) AS categories_names, GROUP_CONCAT(c.color) AS categories_colors
    FROM bookmark b
    LEFT JOIN url u ON b.url_id = u.id
    LEFT JOIN bookmark_category bc ON b.id = bc.bookmark_id
    LEFT JOIN category c ON bc.category_id = c.id
    WHERE b.user_id='${req.query.userID}'
    GROUP BY b.id, b.user_id, b.url_id, b.date_added, u.original
    ORDER BY b.date_added ASC;
  `;

  const conn = await dbConnection();
  const [rows] = await conn.execute(sql);
  await conn.end();

  const marshalledRows = marshallCategories(rows);

  res.json(marshalledRows);
};
