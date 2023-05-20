const dbConnection = require('../../../db/dbinitmysql');
// const dateFormatter = require('../../api/helpers/dateFormatter');
//
//
// module.exports = async (req, res) => {
//   const {
//     from,
//     to,
//   } = dateFormatter(req.query.from, req.query.to);
//
//   const sql = `
//     SELECT s.*, c.name as category, c.color as categoryColor
//     FROM Spendings s
//     LEFT JOIN Categories c ON s.categoryID = c.ID
//     WHERE s.date BETWEEN '${from}' AND '${to}' AND s.userID='${req.query.userID}'
//     ORDER BY date ASC;
//   `;
//
//   dbConnection.query(
//     sql,
//     (err, results) => {
//       res.json(results);
//     }
//   );
// };


// SELECT b.*, u.original as original_url
// from bookmark b
// LEFT JOIN url u ON b.url_id = u.id
// WHERE user_id='${req.query.userID}'
// ORDER BY date_added ASC;
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

  dbConnection.query(
    sql,
    (err, result) => {
      result.forEach(entry => {
        entry.categories = [];
        if (entry.categories_names) {
          let category = {}
          const categories_names = entry.categories_names.split(",");
          const categories_colors = entry.categories_colors.split(",");
          entry.categories = categories_names.map((c, i) => {
            return {
              name: c,
              color: categories_colors[i]
            }
          })
        }
        delete entry.categories_names;
        delete entry.categories_colors;
      })
      res.json(result);
    }
  );
};
