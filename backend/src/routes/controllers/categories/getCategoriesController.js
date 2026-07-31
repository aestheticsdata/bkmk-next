const dbConnection = require("../../../db/dbinitmysql");

/* The user's categories, each with how many records carry it (COS-300).
 *
 * The count is what the filter modal's picker ranks its suggestions by — the ten most-used
 * categories, offered as one click, so that finding `dev` among fifty-three does not mean reading
 * fifty-three. A "most used" list needs a real number behind it or it is an arbitrary ten.
 *
 * **Three details in the join, and each one is load-bearing:**
 *
 * - `LEFT JOIN`, so a category no record carries comes back with `0` rather than disappearing. There
 *   are eight of those in the live database and they are still the user's categories.
 * - `b.active = 1` sits in the **join condition, not the `WHERE`**. In the `WHERE` it would drop the
 *   rows where `b` is `NULL` and turn the outer join into an inner one — the empty categories would
 *   vanish, which is the mistake this note exists to prevent.
 * - `COUNT(DISTINCT b.id)`, because `bookmark_category` has no unique constraint on the pair.
 *
 * `GROUP BY` names all four selected columns rather than relying on `c.id` being the primary key.
 * MySQL infers that functional dependency and `only_full_group_by` accepts the shorter form; spelling
 * it out costs nothing and survives a change of mode.
 *
 * `ORDER BY c.name` moves here from the front, which was sorting the array after parsing it. The order
 * is a property of the list and the database is where lists are ordered.
 *
 * ⚠️ **This does not light up the index rail's counters.** The rail draws `dev 188` beside each
 * category and deliberately shows nothing there — that is DATA 05 (COS-310), with the `storage` block
 * it belongs to. The number exists now; putting it in the rail is that ticket's call, not a side
 * effect of this one.
 *
 * The `conn.end()` is new too: this controller opened a connection per request and never closed one. */
module.exports = async (req, res) => {
  const sql = `
    SELECT c.*, COUNT(DISTINCT b.id) AS bookmarks_count
    FROM category c
        LEFT JOIN bookmark_category bc ON bc.category_id = c.id
        LEFT JOIN bookmark b ON b.id = bc.bookmark_id AND b.active = 1
    WHERE c.user_id = ?
    GROUP BY c.id, c.user_id, c.name, c.color
    ORDER BY c.name;
  `;

  const conn = await dbConnection();
  // The session's user, not the query string's — see `getBookmarksController` (COS-322).
  const [rows] = await conn.execute(sql, [req.user.id]);
  await conn.end();
  res.json(rows);
};
