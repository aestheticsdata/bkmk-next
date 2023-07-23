const dbConnection = require("../../../db/dbinitmysql");
const marshallCategories = require("./helpers/marshallCategories");

const ROWS_BY_PAGE = 20;

module.exports = async (req, res) => {
  // const { page, title, screenshot, url, notes, categories_id, reminder, stars } = req.query;
  const { page, title, screenshot, url, notes, categories_id, stars, reminder } = req.query;

  let countSql = `
      SELECT COUNT(DISTINCT b.id)  AS total_count
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
          ${notes ? `AND b.notes IS NOT NULL` : ''}`;

  if (categories_id) {
    const decodedCategories = decodeURIComponent(categories_id).split(',').map(catId => parseInt(catId, 10));
    for (const categoryId of decodedCategories) {
      countSql += ` AND EXISTS (SELECT 1 FROM bookmark_category bc WHERE b.id = bc.bookmark_id AND bc.category_id = ${categoryId})`;
    }
  }

  console.log("countSql : ", countSql);

  let sql = `
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
        LEFT JOIN alarm a ON b.alarm_id = a.id
    WHERE b.user_id = '${req.query.userID}' AND b.active = 1 
    ${title ? `AND b.title LIKE '%${decodeURIComponent(title)}%'` : ''}
    ${screenshot ? `AND b.screenshot IS NOT NULL` : ''}
    ${url ? `AND b.url_id IS NOT NULL` : ''}
    ${reminder ? `AND a.frequency = '${decodeURIComponent(reminder)}'` : ''}
    ${stars ? ` AND b.stars = ${stars}` : ''}
    ${notes ? `AND b.notes IS NOT NULL` : ''}`;

  if (categories_id) {
    const decodedCategories = decodeURIComponent(categories_id).split(',').map(catId => parseInt(catId, 10));
    for (const categoryId of decodedCategories) {
      sql += ` AND EXISTS (SELECT 1 FROM bookmark_category bc WHERE b.id = bc.bookmark_id AND bc.category_id = ${categoryId})`;
    }
  }
  sql += `
    GROUP BY b.id, b.user_id, b.url_id, u.original
    ORDER BY b.date_added ASC
    LIMIT ${page * ROWS_BY_PAGE}, ${ROWS_BY_PAGE};
  `;

  const conn = await dbConnection();
  const [[totalCount]] = await conn.execute(countSql);
  console.log("totalCount : ", totalCount);
  const [rows] = await conn.execute(sql);

  await conn.end();

  const marshalledRows = marshallCategories(rows);

  res.json(marshalledRows);
};
