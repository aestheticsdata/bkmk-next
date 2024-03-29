const dbConnection = require("../../../db/dbinitmysql");
const marshallCategories = require("./helpers/marshallCategories");

module.exports = async (req, res) => {
  const { page, title, screenshot, url, notes, categories_id, stars, reminder, sort } = req.query;

  let sortPart = "";
  if (sort) {
    sortPart += "ORDER BY ";
    switch (sort) {
        case "link":
          sortPart += "b.url_id ASC, ";
          break;
        case "-link":
          sortPart += "b.url_id DESC, ";
          break;
        case "title":
          sortPart += "b.title ASC, ";
          break;
        case "-title":
          sortPart += "b.title DESC, ";
          break;
        case "stars":
          sortPart += "b.stars ASC, ";
          break;
        case "-stars":
          sortPart += "b.stars DESC, ";
          break;
        case "notes":
          sortPart += "b.notes ASC, ";
          break;
        case "-notes":
          sortPart += "b.notes DESC, ";
          break;
        case "priority":
          sortPart += "b.priority ASC, ";
          break;
        case "-priority":
          sortPart += "b.priority DESC, ";
          break;
        case "screenshot":
          sortPart += "b.screenshot ASC, ";
          break;
        case "-screenshot":
          sortPart += "b.screenshot DESC, ";
          break;
        case "alarm":
          sortPart += "b.alarm_id ASC, ";
          break;
        case "-alarm":
          sortPart += "b.alarm_id DESC, ";
          break;
        case "date":
          sortPart += "b.date_added ASC, ";
          break;
        case "-date":
          sortPart += "b.date_added DESC, ";
          break;
        default:
          break;
      }
    sortPart = sortPart.slice(0, sortPart.length-2);
  }

  let titleMySQLPrepared;
  if (title !== "") {
    titleMySQLPrepared = decodeURIComponent(title).replaceAll(",", "%");
  }

  const commonSQLParts = `
    FROM bookmark b
        LEFT JOIN url u ON b.url_id = u.id
        LEFT JOIN bookmark_category bc ON b.id = bc.bookmark_id
        LEFT JOIN category c ON bc.category_id = c.id
        LEFT JOIN alarm a ON b.alarm_id = a.id
    WHERE b.user_id = '${req.query.userID}' AND b.active = 1 
    ${title ? `AND b.title LIKE '%${titleMySQLPrepared}%'` : ''}
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
    ${sortPart}
    LIMIT ${page * req.query.rows}, ${req.query.rows};
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
