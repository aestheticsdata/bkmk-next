const { format } = require("date-fns");
const dbConnection = require("../../../db/dbinitmysql");
const { normaliseUrl } = require("../../../helpers/normaliseUrl");
const jimpHelper = require("./helpers/jimpHelper");
const generateHexColor = require("./helpers/generateHexColor");

/** The string the form sends to mean "remove the screenshot", kept from the shape the legacy form
 *  used and the one `updateBookmarkBodySchema` describes. **It has to be a word, not a boolean**: a
 *  multipart body carries strings, and `"false"` is truthy — a flag sent unconditionally would erase
 *  a screenshot on every save. The client only ever appends this field when it means it. */
const DELETE_SCREENSHOT = "delete";

const today = () => format(new Date(), "yyyy-MM-dd");

/* The url the record should end up pointing at, given the one it points at now.
 *
 * `url` lives in its own table behind `bookmark.url_id`, so "no url" is a null column and a missing
 * row rather than an empty string. An absent field is therefore a **removal**, which is what the form
 * means by it: it only sends `url` when there is one.
 *
 * ⚠️ **The row is updated in place, which is exactly why `url.normalised` carries no unique key**
 * (COS-338). The table has no `user_id`; if a unique index made two accounts share the row for a page
 * they both bookmarked, this `UPDATE` would rewrite a stranger's link. Every write path here creates
 * its own row, and the normal form is a comparison key rather than an identity. */
const applyUrl = async (conn, bookmark, url) => {
  const { normalised, host } = normaliseUrl(url);

  if (bookmark.url_id) {
    if (url) {
      await conn.execute("UPDATE url SET original=?, normalised=?, host=? WHERE id=?", [
        url,
        normalised,
        host,
        bookmark.url_id,
      ]);
      return;
    }
    // Detach before deleting: the column is what points at the row.
    await conn.execute("UPDATE bookmark SET url_id=NULL WHERE id=?", [bookmark.id]);
    await conn.execute("DELETE FROM url WHERE id=?", [bookmark.url_id]);
    return;
  }

  if (url) {
    const [inserted] = await conn.execute("INSERT INTO url (original, normalised, host) VALUES (?, ?, ?)", [
      url,
      normalised,
      host,
    ]);
    await conn.execute("UPDATE bookmark SET url_id=? WHERE id=?", [inserted.insertId, bookmark.id]);
  }
};

/* The record's categories, as a difference rather than a rebuild.
 *
 * ⚠️ **The comparison this replaces could never be true.** It read
 * `incoming.value === row.category_id.toString()`, strictly, against a `value` the form now sends as
 * a **number** — so every category was deleted and re-inserted on every single save. Ids are compared
 * as numbers here, on both sides, which is what they are.
 *
 * A tag with no `id` is one to create. It is looked up by name first: the picker will not offer a
 * name that already exists, but a name can still be typed, and the alternative is a second category
 * with the same name and a different colour. `category.name` is the 20-character column
 * `FIELD_LIMITS.categoryName` mirrors. */
const applyCategories = async (conn, bookmark, incoming) => {
  const [linked] = await conn.execute("SELECT category_id FROM bookmark_category WHERE bookmark_id=?", [bookmark.id]);
  const linkedIds = new Set(linked.map((row) => Number(row.category_id)));

  const keep = new Set();

  for (const category of incoming) {
    const existingId = Number(category.id ?? category.value);

    if (Number.isFinite(existingId)) {
      keep.add(existingId);
      continue;
    }

    const name = String(category.label ?? "").trim();
    if (name === "") continue;

    const [[named]] = await conn.execute("SELECT id FROM category WHERE user_id=? AND name=? LIMIT 1", [
      bookmark.user_id,
      name,
    ]);

    if (named) {
      keep.add(Number(named.id));
      continue;
    }

    const [created] = await conn.execute("INSERT INTO category (name, color, user_id) VALUES (?, ?, ?)", [
      name,
      generateHexColor(),
      bookmark.user_id,
    ]);
    keep.add(Number(created.insertId));
  }

  for (const categoryId of linkedIds) {
    if (!keep.has(categoryId)) {
      await conn.execute("DELETE FROM bookmark_category WHERE bookmark_id=? AND category_id=?", [
        bookmark.id,
        categoryId,
      ]);
    }
  }

  for (const categoryId of keep) {
    if (!linkedIds.has(categoryId)) {
      await conn.execute("INSERT INTO bookmark_category (bookmark_id, category_id) VALUES (?, ?)", [
        bookmark.id,
        categoryId,
      ]);
    }
  }
};

/* The reminder.
 *
 * ⚠️ **The "unchanged, so leave it alone" branch never ran.** It compared `frequency`, destructured
 * as `[[frequency]]` off a `SELECT frequency` — so the *row object* — against `req.body.reminder`, a
 * string. An object is never equal to a string, so every save deleted the alarm and inserted a new
 * one dated today: the countdown on the alarms screen reset to a full period each time the record
 * was touched, which is precisely what that branch existed to prevent. Both sides are numbers here.
 *
 * And when the frequency really does change, the row is **updated** rather than dropped and
 * recreated. The alarms screen keys its rows on `alarm.id`; recycling the id keeps that stable, and
 * there was never a reason to renumber. `date_added` still moves, because it is the anchor the whole
 * repeat is computed from and a new rhythm starts now. */
const applyAlarm = async (conn, bookmark, reminder) => {
  const frequency = Number(reminder);
  const wanted = Number.isFinite(frequency) && frequency > 0 ? frequency : null;

  if (bookmark.alarm_id) {
    if (wanted === null) {
      await conn.execute("UPDATE bookmark SET alarm_id=NULL WHERE id=?", [bookmark.id]);
      await conn.execute("DELETE FROM alarm WHERE id=?", [bookmark.alarm_id]);
      return;
    }

    const [[alarm]] = await conn.execute("SELECT frequency FROM alarm WHERE id=?", [bookmark.alarm_id]);
    if (alarm && Number(alarm.frequency) === wanted) return;

    await conn.execute("UPDATE alarm SET frequency=?, date_added=? WHERE id=?", [wanted, today(), bookmark.alarm_id]);
    return;
  }

  if (wanted !== null) {
    const [created] = await conn.execute("INSERT INTO alarm (frequency, date_added) VALUES (?, ?)", [wanted, today()]);
    await conn.execute("UPDATE bookmark SET alarm_id=? WHERE id=?", [created.insertId, bookmark.id]);
  }
};

/** Removing the file on disk and the filename in the row, in that order — a row still naming a file
 *  that is gone is what the record screen would try to fetch. */
const dropScreenshot = async (conn, bookmark) => {
  if (!bookmark.screenshot) return;
  await jimpHelper.deleteScreenshot({ filename: bookmark.screenshot, userID: bookmark.user_id });
  await conn.execute("UPDATE bookmark SET screenshot=NULL WHERE id=? AND user_id=?", [bookmark.id, bookmark.user_id]);
};

/* `PUT /bookmarks` — saving a record (COS-319).
 *
 * Rewritten with the edit modal, as the note left on this file said it would be. What it replaced
 * was 25 statements in a tree of nested branches, each with its own `try`, its own `conn.end()` and
 * its own message — around 200 lines in which two comparisons were silently always-true and nothing
 * was atomic. The behaviour is deliberately the same one field at a time; what changed is that each
 * field is now a named function, the whole save is one transaction, and the connection is closed in
 * one place.
 *
 * **Three defects went with the rewrite**, each noted where it lived: the categories comparison, the
 * alarm comparison, and the scope below.
 *
 * ⚠️ **The record is loaded scoped to the session's user, and a miss is a 404.** It used to be
 * `SELECT * FROM bookmark WHERE id=?` — any signed-in account could save over any other account's
 * record by putting its id in the body, and the answer would have been `bookmark edited`. The read
 * that follows is also what every helper below trusts for `user_id`, so scoping it here scopes the
 * categories and the screenshot with it. Reading it from the session rather than from the request is
 * the same fix COS-322 owes the list controllers.
 *
 * **One transaction.** A save touches up to five tables, and half of a save is worse than none: an
 * error between the title and the categories used to leave the record renamed and its tags as they
 * were, with a 500 and no way to tell which half had landed. The screenshot's file is the one thing
 * a rollback cannot undo — a failed commit can leave an orphan on disk, which is a cheaper wrong
 * than a row naming a file that is not there.
 *
 * The `console.log` of `req.body` on every edit is gone with it. */
module.exports = async (req, res) => {
  const conn = await dbConnection();

  try {
    const [[bookmark]] = await conn.execute("SELECT * FROM bookmark WHERE id=? AND user_id=? AND active=1", [
      req.body.id,
      req.user.id,
    ]);

    if (!bookmark) {
      return res.status(404).json({ msg: "bookmark not found" });
    }

    await conn.beginTransaction();

    await conn.execute(
      `UPDATE bookmark
          SET title=?, notes=?, stars=?, priority=?, date_last_modified=?
        WHERE id=?`,
      [
        req.body.title,
        req.body.notes || null,
        req.body.stars,
        // `""` is the form's "no level", and the column holds `NULL` for it.
        req.body.priority === "" ? null : req.body.priority,
        today(),
        bookmark.id,
      ],
    );

    await applyUrl(conn, bookmark, req.body.url);
    await applyCategories(conn, bookmark, JSON.parse(req.body.categories));
    await applyAlarm(conn, bookmark, req.body.reminder);

    if (req.file) {
      // A replacement removes the previous file: the column holds one name.
      await dropScreenshot(conn, bookmark);
      const filename = await jimpHelper.createScreenshot({ file: req.file, userID: bookmark.user_id });
      await conn.execute("UPDATE bookmark SET screenshot=? WHERE id=? AND user_id=?", [
        filename,
        bookmark.id,
        bookmark.user_id,
      ]);
    } else if (req.body.deleteScreenshot === DELETE_SCREENSHOT) {
      await dropScreenshot(conn, bookmark);
    }

    await conn.commit();
    return res.status(200).json({ msg: "bookmark edited" });
  } catch (e) {
    await conn.rollback().catch(() => {});
    return res.status(500).json({ msg: "error editing bookmark : " + e });
  } finally {
    await conn.end();
  }
};
