const dbConnection = require("../../../db/dbinitmysql");
const { EXPORT_FORMATS } = require("./helpers/exportFormats");
const marshallCategories = require("./helpers/marshallCategories");

/* `GET /bookmarks/export?format=json|csv|html` — the whole index, out (COS-333).
 *
 * There was no way out at all. `POST /bookmarks/import` reads a file in and nothing ever wrote one,
 * so the only readable copy of an account's records was the `mysqldump` `cron/cron-mysql.js` ships
 * over SFTP twice a day. `helpers/exportFormats` is what each format looks like and why.
 *
 * ⚠️ **The whole index, not the filtered view.** The join is `getBookmarksController`'s, minus its
 * filters and minus its `LIMIT`: an export is what you take when you are leaving or backing up, and
 * a control that silently hands you a subset of your own records is the one thing a backup must not
 * do. Exporting a filter is a different feature, and it needs a screen that says which one is
 * applied — this one is a menu on a command bar.
 *
 * **`b.active = 1`**, the reading every list uses. A retired record is on no screen; an export that
 * carried it would be the only place it reappears.
 *
 * **No pagination, and that is a bounded promise rather than an open one.** The largest account here
 * holds 1 280 records, whose json is a few hundred kilobytes — one query and one string. If an index
 * ever reaches the size where that is not true, the answer is a streamed response, not a page
 * parameter: half an export is not an export.
 *
 * ⚠️ **`AND c.user_id = b.user_id` is COS-345, and this file is the reason it is worth naming here.**
 * The ticket lists the two read controllers it found; this one was written the day after it and
 * inherited the join whole, unscoped predicate included. An export is also the worst place for it —
 * the file is kept, and a stranger's category name would have been copied into it rather than merely
 * shown once. Same predicate, same reason it belongs in the join and not the `WHERE`.
 */

/** `attachment`, so the browser saves the file rather than rendering it — a Netscape bookmark file is
 *  `text/html` and would otherwise open as a page of links. The date makes two exports two files. */
const disposition = (extension, day) => `attachment; filename="bkmk-${day}.${extension}"`;

const RECORDS = `
  SELECT b.*,
         u.original AS original_url,
         a.frequency AS alarm_frequency,
         GROUP_CONCAT(c.name ORDER BY c.name)  AS categories_names,
         GROUP_CONCAT(c.color ORDER BY c.name) AS categories_colors,
         GROUP_CONCAT(c.id ORDER BY c.name)    AS categories_id
    FROM bookmark b
    LEFT JOIN url u ON b.url_id = u.id
    LEFT JOIN bookmark_category bc ON b.id = bc.bookmark_id
    LEFT JOIN category c ON bc.category_id = c.id AND c.user_id = b.user_id
    LEFT JOIN alarm a ON b.alarm_id = a.id
   WHERE b.user_id = ? AND b.active = 1
GROUP BY b.id
ORDER BY b.date_added DESC, b.id DESC
`;

module.exports = async (req, res) => {
  const format = EXPORT_FORMATS[req.validated.query.format];
  const conn = await dbConnection();

  try {
    const [rows] = await conn.execute(RECORDS, [req.user.id]);
    const records = marshallCategories(rows);

    const exportedAt = new Date().toISOString();
    const body = format.write(records, { exportedAt });

    res.setHeader("Content-Type", format.contentType);
    res.setHeader("Content-Disposition", disposition(format.extension, exportedAt.slice(0, 10)));
    /* The count, on a header, because two of the three formats have nowhere to put it and the screen
     * wants to say `312 records exported` without parsing the file it just downloaded. Exposed
     * through `Access-Control-Expose-Headers`, or a cross-origin client reads `undefined` — in
     * development the front is on 3100 and this is on 3101. */
    res.setHeader("X-Record-Count", String(records.length));
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, X-Record-Count");

    return res.status(200).send(body);
  } catch (e) {
    return res.status(500).json({ msg: `error exporting bookmarks : ${e}` });
  } finally {
    await conn.end();
  }
};
