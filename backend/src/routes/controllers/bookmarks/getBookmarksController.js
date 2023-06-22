const dbConnection = require('../../../db/dbinitmysql');

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

  rows.forEach(entry => {
    entry.categories = [];
    if (entry.categories_names) {
      const categories_names = entry.categories_names.split(",");
      const categories_colors = entry.categories_colors.split(",");
      entry.categories = categories_names.map((c, i) => {
        return {
          name: c,
          color: categories_colors[i],
        }
      })
    }
    delete entry.categories_names;
    delete entry.categories_colors;
  });

  res.json(rows);
};
