const dbConnection = require("../../../db/dbinitmysql");
const marshallCategories = require("./helpers/marshallCategories");

/* The filters are prepared, not interpolated (COS-295).
 *
 * The conditions are collected into an array alongside their values, so the fragment and the
 * parameter that fills it are written on the same line and cannot drift apart. The count
 * query and the rows query share both — which is the reason for building them once: a filter
 * added to one and forgotten in the other would report a total the page does not match.
 *
 * **Two things stay interpolated, and both have to be.**
 *
 * `sort` is a column name and a direction, which no placeholder can carry. It is safe because
 * it is never client text: the `switch` below only ever produces literals written here, and
 * COS-318's schema rejects anything outside that list before the request arrives.
 *
 * `LIMIT` is a placeholder MySQL refuses — verified against the 8.4.5 this runs on, where
 * `LIMIT ?` in a prepared statement fails with `ER_WRONG_ARGUMENTS` however the value is
 * typed. So the two numbers are interpolated, and they are taken from `req.validated.query`
 * rather than `req.query`: zod has already coerced them to integers there
 * (`rows` ≤ 500 and positive, `page` ≥ 0), which is what makes writing them into the string
 * safe. It is the first use of `req.validated` in a controller — the migration
 * `middlewares/validate.js` describes — and here it is load-bearing rather than tidiness.
 * Everything else in the file still reads `req.query`; converting the rest belongs to the
 * DATA lot. */
module.exports = async (req, res) => {
  const { title, categories_id, stars, reminder, sort, priority } = req.query;
  /* Integers, guaranteed by `listBookmarksQuerySchema` — see the note on `LIMIT` above.
   *
   * **The five flags come from `req.validated.query` too** (COS-299), and that is a fix rather than
   * tidiness: read off `req.query` they are raw strings, and `if ("0")` is true, so `?screenshot=0`
   * switched the filter on. `queryFlagSchema` now turns `0` and `false` into `false`, which only
   * helps if the validated value is the one read. The remaining fields stay on `req.query` — that
   * conversion belongs to the DATA lot. */
  const { page, rows, screenshot, url, notes, starred, alarm } = req.validated.query;

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
      /* The index's `tags` column (COS-299). It orders on the aggregated names rather than on a
       * column, because a bookmark has several categories and there is no single value to compare:
       * `demoscene,dev` sorts after `amiga,css` and before `dev`, which is what reading the column
       * top to bottom suggests it should do. Untagged rows collect at one end — `NULL` sorts first
       * ascending, last descending — and that is useful in both directions.
       *
       * The alias is safe to name here for the same reason as the columns above: this string is
       * written in this file, never taken from the request. */
      case "tags":
        sortPart += "categories_names ASC, ";
        break;
      case "-tags":
        sortPart += "categories_names DESC, ";
        break;
      default:
        break;
    }
    sortPart = sortPart.slice(0, sortPart.length - 2);
  }

  const conditions = ["b.user_id = ?", "b.active = 1"];
  const conditionParams = [req.query.userID];

  if (title) {
    // The comma is the form's "or" separator, turned into a MySQL wildcard. It is part of
    // the pattern, so it goes in the value, not in the SQL.
    conditions.push("b.title LIKE ?");
    conditionParams.push(`%${decodeURIComponent(title).replaceAll(",", "%")}%`);
  }
  if (screenshot) {
    conditions.push("b.screenshot IS NOT NULL");
  }
  if (url) {
    conditions.push("b.url_id IS NOT NULL");
  }
  if (reminder) {
    conditions.push("a.frequency = ?");
    conditionParams.push(decodeURIComponent(reminder));
  }
  if (stars) {
    conditions.push("b.stars = ?");
    conditionParams.push(stars);
  }
  if (notes) {
    conditions.push("b.notes IS NOT NULL");
  }

  /* The index rail's scopes (COS-299) — coarse cuts, next to the fine filters above.
   *
   * `starred` is `> 0` where `stars` is `=`: the scope asks "rated at all", the filter asks
   * "rated exactly this". `alarm` is a presence test on the join column, not on `a.frequency`
   * like `reminder` — a bookmark can have an alarm of any frequency.
   *
   * `priority` is a list, so `IN` with one placeholder per level. The rail's `prio high` sends
   * `high,highest`: a shortcut labelled "high" that hid the level above it would surprise, and
   * this is the coarse control. `listBookmarksQuerySchema` accepts only the four literals, and
   * every one of them still travels as a parameter. */
  if (starred) {
    conditions.push("b.stars > 0");
  }
  if (alarm) {
    conditions.push("b.alarm_id IS NOT NULL");
  }
  if (priority) {
    const levels = decodeURIComponent(priority).split(",");
    conditions.push(`b.priority IN (${levels.map(() => "?").join(", ")})`);
    conditionParams.push(...levels);
  }

  // One `EXISTS` per selected category, so a bookmark has to carry them all rather than any
  // of them. The subquery's alias is `bc2`: `bc` would shadow the outer join's.
  if (categories_id) {
    for (const categoryId of decodeURIComponent(categories_id)
      .split(",")
      .map((catId) => parseInt(catId, 10))) {
      conditions.push(
        "EXISTS (SELECT 1 FROM bookmark_category bc2 WHERE b.id = bc2.bookmark_id AND bc2.category_id = ?)",
      );
      conditionParams.push(categoryId);
    }
  }

  const commonSQLParts = `
    FROM bookmark b
        LEFT JOIN url u ON b.url_id = u.id
        LEFT JOIN bookmark_category bc ON b.id = bc.bookmark_id
        LEFT JOIN category c ON bc.category_id = c.id
        LEFT JOIN alarm a ON b.alarm_id = a.id
    WHERE ${conditions.join(" AND ")}
  `;

  const countSql = `
      SELECT COUNT(DISTINCT b.id)  AS total_count
      ${commonSQLParts}`;

  /* The three lists are zipped back together by `marshallCategories`, position by position, so they
   * have to be aggregated in the *same* order. Unordered `GROUP_CONCAT` happens to agree today and is
   * not promised to; one `ORDER BY c.name` on each makes it a rule — and has the side effect the index
   * wanted anyway: chips come out alphabetical, and the `tags` sort above compares like with like.
   *
   * The note lives out here rather than as a `--` comment inside the template literal, because a
   * comment naming SQL identifiers in backticks ends the template. It did, and the query with it. */
  const sql = `
    SELECT b.*,
           u.original AS original_url,
           GROUP_CONCAT(c.name ORDER BY c.name) AS categories_names,
           GROUP_CONCAT(c.color ORDER BY c.name) AS categories_colors,
           GROUP_CONCAT(c.id ORDER BY c.name) AS categories_id
    ${commonSQLParts}
    GROUP BY b.id, b.user_id, b.url_id, u.original, b.date_added
    ${sortPart}
    LIMIT ${page * rows}, ${rows};
  `;

  const conn = await dbConnection();
  const [[{ total_count }]] = await conn.execute(countSql, conditionParams);
  const [bookmarks] = await conn.execute(sql, conditionParams);

  await conn.end();

  const marshalledRows = marshallCategories(bookmarks);

  const rowsWithCount = {
    rows: marshalledRows,
    total_count,
  };

  res.json(rowsWithCount);
};
