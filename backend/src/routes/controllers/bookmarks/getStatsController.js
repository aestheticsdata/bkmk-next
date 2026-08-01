const dbConnection = require("../../../db/dbinitmysql");

/* `GET /bookmarks/stats` — the rail's `storage` block (COS-310, DATA 05).
 *
 * Two numbers, and they are the two the handoff's block draws: how many records the account holds,
 * and how many of them carry a screenshot. `shots 84/312` is the pair written out and the meter
 * underneath is one over the other.
 *
 * ⚠️ **`records` is not the index's `total`, and that is why it cannot come from there.** The list
 * endpoint answers the *current query* — filter to one category and its total is that category's.
 * The rail's `all` row means the whole index whatever is filtered, so it needs a count nothing
 * filters, and the same goes for the denominator of `shots`: a screenshot ratio that moved with the
 * query would be a different measurement each time you clicked a category.
 *
 * ⚠️ **`db 1.4 mb` is not here, and it is not an omission.** The handoff draws a third line under the
 * meter; the owner's call on 2026-08-01 is that it is decoration, and it goes the way §8.1 sent
 * `uptime`, `IDX/2.4.1` and the two asides. It could only ever have been one of three things — the
 * schema's size, which on a box shared with pfa is not this account's; an estimate from row counts,
 * which is an invented reading with a unit on it; or the screenshots on disk, which is not what the
 * word `db` says. None of the three is worth a line in a rail this dense.
 *
 * `COUNT(screenshot)` rather than a `SUM(... IS NOT NULL)`: `COUNT` over a column skips nulls, which
 * is the whole question. Checked against the column first — 24 non-null values and **no empty
 * strings** across the 1 280 live records — so there is no second spelling of "no screenshot" for it
 * to miss.
 *
 * `b.active = 1`, like every other reading of this table: a record in the bin is on no screen, and a
 * ratio that counted it would not match the index it sits beside. */
module.exports = async (req, res) => {
  const sql = `
    SELECT COUNT(*)        AS records,
           COUNT(screenshot) AS shots
      FROM bookmark
     WHERE user_id = ? AND active = 1
  `;

  const conn = await dbConnection();

  try {
    // The session's user, not the query string's — see `getBookmarksController` (COS-322).
    const [[stats]] = await conn.execute(sql, [req.user.id]);
    return res.status(200).json({ records: Number(stats.records), shots: Number(stats.shots) });
  } finally {
    await conn.end();
  }
};
