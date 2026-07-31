const { format } = require("date-fns");
const dbConnection = require("../../../db/dbinitmysql");

/* `DELETE /bookmarks/:id` — the soft delete, now scoped to the record's owner (COS-322).
 *
 * ⚠️ **An id was the only thing this asked for.** The statement was `WHERE id=?` and nothing else,
 * so any signed-in account could retire any record in the database by its number — the same hole
 * `editBookmarkController` closed for saving one ticket earlier, on the write that is harder to
 * notice because it leaves nothing on screen. The identity comes from the session; there is no
 * `?userID=` here to have trusted in the first place, which is why this file needed the check added
 * rather than moved.
 *
 * ⚠️ **The ownership test is a read, not an extra `AND` on the `UPDATE`.** Both refuse the write.
 * What only the read can do is tell "not yours" from "already inactive": `affectedRows` counts rows
 * MySQL actually *changed*, so writing `active=0` over a record that is already `0` reports zero
 * either way, and a second delete of your own record would answer `404`. Re-deleting stays the no-op
 * it has always been, and the answer is honest in the case that matters.
 *
 * A record that is not yours and a record that does not exist get the same `404`. Two answers would
 * still say which ids are real.
 *
 * **The two `UPDATE`s became one.** They always wrote the same row, and a failure between them left
 * a record retired with no date saying when. One statement is also one place to scope. */
module.exports = async (req, res) => {
  const conn = await dbConnection();
  const { id } = req.params;

  try {
    const [[bookmark]] = await conn.execute("SELECT id FROM bookmark WHERE id=? AND user_id=?", [id, req.user.id]);

    if (!bookmark) {
      return res.status(404).json({ msg: "bookmark not found" });
    }

    await conn.execute("UPDATE bookmark SET active=0, date_inactive=? WHERE id=?", [
      format(new Date(), "yyyy-MM-dd"),
      bookmark.id,
    ]);

    return res.status(200).json({ msg: "bookmark deleted" });
  } catch (err) {
    return res.status(500).json({ msg: "error deleting bookmark : " + err });
  } finally {
    await conn.end();
  }
};
