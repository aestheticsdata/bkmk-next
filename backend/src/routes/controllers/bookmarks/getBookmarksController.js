const dbConnection = require("../../../db/dbinitmysql");
const marshallCategories = require("./helpers/marshallCategories");

const ROWS_BY_PAGE = 10;

module.exports = async (req, res) => {
  const sql = `
    SELECT b.*,
           u.original AS original_url,
           GROUP_CONCAT(c.name) AS categories_names,
           GROUP_CONCAT(c.color) AS categories_colors,
           GROUP_CONCAT(c.id) AS categories_id,
    (SELECT COUNT(*) FROM bookmark b WHERE b.user_id = '${req.query.userID}' AND b.active = 1) AS total_count
    FROM bookmark b
    LEFT JOIN url u ON b.url_id = u.id
    LEFT JOIN bookmark_category bc ON b.id = bc.bookmark_id
    LEFT JOIN category c ON bc.category_id = c.id
    WHERE b.user_id='${req.query.userID}' AND b.active=1
    GROUP BY b.id, b.user_id, b.url_id, b.date_added, u.original
    ORDER BY b.date_added ASC
    LIMIT ${req.query.page*ROWS_BY_PAGE}, ${ROWS_BY_PAGE};
  `;

  const conn = await dbConnection();
  const [rows] = await conn.execute(sql);
  await conn.end();

  const marshalledRows = marshallCategories(rows);

  res.json(marshalledRows);
};
