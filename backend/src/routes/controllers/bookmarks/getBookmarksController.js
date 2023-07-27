const dbConnection = require("../../../db/dbinitmysql");
const marshallCategories = require("./helpers/marshallCategories");

const ROWS_BY_PAGE = 20;

module.exports = async (req, res) => {
  const { page, title, screenshot, url, notes, categories_id, stars, reminder } = req.query;

  const commonSQLParts = `
    FROM bookmark b
        LEFT JOIN url u ON b.url_id = u.id
        LEFT JOIN bookmark_category bc ON b.id = bc.bookmark_id
        LEFT JOIN category c ON bc.category_id = c.id
        LEFT JOIN alarm a ON b.alarm_id = a.id
    WHERE b.user_id = '${req.query.userID}' AND b.active = 1 
    ${title ? `AND b.title LIKE '%${decodeURIComponent(title)}%'` : ''}
    ${screenshot ? `AND b.screenshot IS NOT NULL` : ''}
    ${url ? `AND b.url_id IS NOT NULL` : ''}
    ${reminder ? `AND a.frequency = '${decodeURIComponent(reminder)}'` : ''}
    ${stars ? ` AND b.stars = ${stars}` : ''}
    ${notes ? `AND b.notes IS NOT NULL` : ''}
  `;

  const sqlCategoriesHelper = (sql) => {
    const decodedCategories = decodeURIComponent(categories_id).split(',').map(catId => parseInt(catId, 10));
    for (const categoryId of decodedCategories) {
      sql += ` AND EXISTS (SELECT 1 FROM bookmark_category bc WHERE b.id = bc.bookmark_id AND bc.category_id = ${categoryId})`;
    }
    return sql;
  }

  let countSql = `
      SELECT COUNT(DISTINCT b.id)  AS total_count
      ${commonSQLParts}`;

  if (categories_id) {
    countSql = sqlCategoriesHelper(countSql);
  }

  let sql = `
    SELECT b.*,
           u.original AS original_url,
           GROUP_CONCAT(c.name) AS categories_names,
           GROUP_CONCAT(c.color) AS categories_colors,
           GROUP_CONCAT(c.id) AS categories_id
    ${commonSQLParts}`;

  if (categories_id) {
    sql = sqlCategoriesHelper(sql);
  }
  sql += `
    GROUP BY b.id, b.user_id, b.url_id, u.original, b.date_added
    ORDER BY b.date_added ASC
    LIMIT ${page * ROWS_BY_PAGE}, ${ROWS_BY_PAGE};
  `;

  const conn = await dbConnection();
  const [[{total_count}]] = await conn.execute(countSql);
  const [rows] = await conn.execute(sql);

  await conn.end();

  const marshalledRows = marshallCategories(rows);

  const rowsWithCount = {
    rows: marshalledRows,
    total_count,
  };


  res.json(rowsWithCount);
};
