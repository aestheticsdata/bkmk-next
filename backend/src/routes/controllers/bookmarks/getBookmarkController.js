const dbConnection = require("../../../db/dbinitmysql");
const marshallCategories = require("./helpers/marshallCategories");

/* The `GROUP BY` is new, and it is what parameterising this query cost (COS-295).
 *
 * The statement aggregates (`GROUP_CONCAT`) while also selecting `b.*`, which
 * `only_full_group_by` normally refuses. It used to be accepted because the interpolated
 * `WHERE b.id = 12` let MySQL 8 see an equality on the primary key and infer that every other
 * column was functionally dependent on it. A placeholder hides the literal at prepare time,
 * the inference is gone, and the server answers with the `only_full_group_by` error instead.
 * Grouping by `b.id` says out loud what the `WHERE` already guaranteed: one row. */
module.exports = async (req, res) => {
  const getSingleBookmarkSQL = `
      SELECT b.*,
             a.frequency AS alarm_frequency,
             a.date_added AS alarm_date_added,
             u.original AS original_url,
             GROUP_CONCAT(c.name) AS categories_names,
             GROUP_CONCAT(c.color) AS categories_colors,
             GROUP_CONCAT(c.id) AS categories_id
      FROM bookmark b
      LEFT JOIN url u ON b.url_id = u.id
      LEFT JOIN bookmark_category bc ON b.id = bc.bookmark_id
      LEFT JOIN category c ON bc.category_id = c.id
      LEFT JOIN alarm a ON b.alarm_id = a.id
      WHERE b.id = ?
      GROUP BY b.id;
  `;

  const conn = await dbConnection();
  const [bookmark] = await conn.execute(getSingleBookmarkSQL, [req.params.id]);
  await conn.end();

  const marshalledRows = marshallCategories(bookmark);

  res.json(marshalledRows);
};
