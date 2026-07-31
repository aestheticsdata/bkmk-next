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

/* ⚠️ **`AND b.user_id = ?` is the whole of COS-322 in this file, and here it was missing outright.**
 *
 * The three list controllers at least scoped their rows — on `?userID=`, a value the caller writes,
 * which is the bug the ticket is named for. This one did not scope at all: an id was enough, and
 * record ids are small integers. So the fix is not "read the identity from the right place" but
 * "read the identity", and the session is the only place it can come from.
 *
 * ⚠️ **A record that is not yours answers exactly like a record that does not exist**, and this
 * route already had an answer for that: the empty array, which `useBookmarkRecord` reads as `missing`
 * and the screen prints as `RECORD_TEXT.states.missing`. So the scoped query returns `[]` where it
 * used to return a row, and a stranger's record becomes indistinguishable from a number nobody used.
 *
 * It does **not** follow `editBookmarkController`'s `404`, and the reason is the contract rather than
 * the disclosure — either status is equally silent, since both cases would share it. `200` with `[]`
 * is what this endpoint has always said for "no such record", and matching it is what lets a
 * server-side scoping fix ship without touching a hook, a schema or a screen. Aligning the three
 * routes on one status is worth doing; it is a client change, and it belongs to the ticket that is
 * already rewriting these calls (COS-306).
 *
 * **`b.active` stays out of the `WHERE`**, unchanged: a soft-deleted record is still readable by its
 * owner through a direct link, which is the behaviour this screen has always had. Whether it should
 * is a question for the DATA lot, not for a scoping fix. */
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
      WHERE b.id = ? AND b.user_id = ?
      GROUP BY b.id;
  `;

  const conn = await dbConnection();
  const [bookmark] = await conn.execute(getSingleBookmarkSQL, [req.params.id, req.user.id]);
  await conn.end();

  const marshalledRows = marshallCategories(bookmark);

  res.json(marshalledRows);
};
