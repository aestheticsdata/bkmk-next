const dbConnection = require("../../../db/dbinitmysql");
const marshallCategories = require("./helpers/marshallCategories");

/** The window behind the filter modal's `≤ 3d` reminder segment (COS-300): how many days from now a
 *  reminder has to fire to count as due.
 *
 *  ⚠️ **The label is the other half of this number** — `filters.reminderStates.due` in
 *  `frontend/src/text/index.ts` reads `≤ 3d`. Same hand-copied arrangement as `FIELD_LIMITS`; the two
 *  move together. */
const REMINDER_DUE_DAYS = 3;

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
 *
 * ⚠️ **Every field now comes from there** (COS-306), which is what that migration note called the
 * DATA lot's job. Nothing in the query changes: zod hands the text filters back as the same strings.
 * What changes is `stars`, which arrives as a number instead of the string `"0"` — and `if ("0")` is
 * true, so `?stars=0` used to add a `b.stars >= 0` that matched everything it was asked to exclude
 * nothing from. It was harmless and it was the same class of bug `queryFlagSchema` was written for. */
module.exports = async (req, res) => {
  /* Integers, guaranteed by `listBookmarksQuerySchema` — see the note on `LIMIT` above.
   *
   * **The three flags in particular** (COS-299): read off `req.query` they are raw strings, so
   * `?screenshot=0` switched the filter on. `queryFlagSchema` turns `0` and `false` into `false`,
   * which only helps if the validated value is the one read. */
  const { page, rows, title, categories_id, stars, sort, priority, screenshot, url, notes, alarm } =
    req.validated.query;

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

  /* ⚠️ **The scope comes from the session, and `?userID=` is not read** (COS-322).
   *
   * This condition was always here — the query has never returned another account's rows by accident.
   * What it filtered *on* was `req.query.userID`, the client's own claim about who it is, which an
   * authenticated request can write to say anything. Since COS-294 the session holds the real
   * identity and `sessionAuthMiddleware` puts it on `req.user`, so the value that decides what comes
   * back is now the one the server issued rather than the one the caller typed.
   *
   * The parameter stayed on the wire through that fix — validated and inert — so that the front had
   * nothing to change; **COS-306 has since removed it from both sides**, and this line is unaffected
   * either way. That is the point of having done it in two steps. See `schemas/bookmarks.js`. */
  const conditions = ["b.user_id = ?", "b.active = 1"];
  const conditionParams = [req.user.id];

  /* ⚠️ **This line is the defect COS-334 was opened for, and it had two halves.**
   *
   * The pattern was `decodeURIComponent(title)`, matched against a column holding
   * `Solving%20Distributed%20Systems` for every imported and legacy row — so a search containing a
   * space could not match the rows that are most of the index. The column holds the text itself
   * since `2026-08-01-decode-text.js`, and the two sides finally spell the same thing.
   *
   * The decode was also a **second** one. Express has already unescaped the query string by the time
   * a controller reads it, so `?title=100%25` arrives here as `100%` — and `decodeURIComponent` on a
   * `%` that is not an escape throws. Searching for `100%` answered 500 through `catchAsync`. Both
   * halves go with the same character.
   *
   * ⚠️ **And removing that decode uncovered a third thing, so it is fixed here rather than left.**
   * The input is interpolated into a `LIKE` pattern, where `%` and `_` are wildcards. `_` has always
   * been one silently — `a_command` matches `a Command`. `%` used to be the 500 above, so nobody ever
   * saw what it did; without the decode it stops throwing and starts matching anything, which is a
   * search for `100%` quietly answering with rows that have nothing to do with it. Trading a crash
   * for a wrong answer is not a fix, so both are escaped, backslash first because it is the escape
   * character. The comma is mapped **after** that, since it is the one wildcard this search means:
   * it is the form's "or" separator, and it is part of the pattern, so it goes in the value rather
   * than in the SQL. */
  if (title) {
    const pattern = title.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_").replaceAll(",", "%");
    conditions.push("b.title LIKE ?");
    conditionParams.push(`%${pattern}%`);
  }
  if (screenshot) {
    conditions.push("b.screenshot IS NOT NULL");
  }
  if (url) {
    conditions.push("b.url_id IS NOT NULL");
  }
  /* ⚠️ **`>=`, not `=`** (COS-300). The filter modal's stars group reads `any / 1+ / 2+ / 3+ / 4+ / 5`
   * — a minimum, which is what a rating filter means and what the equality could not express: asking
   * for "3+" used to return exactly the three-star records and hide the four- and five-star ones.
   *
   * It also absorbs COS-299's `starred` scope, which was `b.stars > 0` under its own parameter:
   * "rated at all" is `stars=1` now, so the rail's row and the modal's `1+` segment are the same
   * filter rather than two spellings of it. `stars=0` is a no-op by construction. */
  if (stars) {
    conditions.push("b.stars >= ?");
    conditionParams.push(stars);
  }
  if (notes) {
    conditions.push("b.notes IS NOT NULL");
  }

  /* The reminder filter (COS-300), one enum where COS-299 had a presence flag.
   *
   * `armed` and `none` are the two sides of the join column. `due` is the modal's `≤ 3d`, and it is
   * the only condition in this file that computes anything: an alarm has no next-fire column — it
   * repeats every `frequency` days from `date_added`, which is how `getRemindersController` decides
   * that one fires today (`differenceInDays % frequency === 0`).
   *
   * So days-until-next-fire is `frequency - (days_elapsed mod frequency)`, wrapped in one more `MOD`
   * so that an alarm firing **today** comes out 0 rather than a whole period. `frequency > 0` guards
   * the modulo: the schema will not accept a zero, but this column has no constraint and `MOD(x, 0)`
   * is `NULL`, which would silently drop rows instead of failing.
   *
   * `MOD(...)` and `DATEDIFF` are MySQL's; the window is a parameter like everything else. */
  switch (alarm) {
    case "armed":
      conditions.push("b.alarm_id IS NOT NULL");
      break;
    case "none":
      conditions.push("b.alarm_id IS NULL");
      break;
    case "due":
      conditions.push(
        "a.frequency > 0 AND MOD(a.frequency - MOD(DATEDIFF(CURDATE(), a.date_added), a.frequency), a.frequency) <= ?",
      );
      conditionParams.push(REMINDER_DUE_DAYS);
      break;
    default:
      break;
  }

  /* `priority` is a list, so `IN` with one placeholder per level. The rail's `prio high` sends
   * `high,highest`: a shortcut labelled "high" that hid the level above it would surprise, and that is
   * the coarse control.
   *
   * **`none` is in the list but not in the column** (COS-300): the modal draws a fifth segment `—` for
   * records with no priority, and `NULL` is not a value `IN` can match. It is split back out here into
   * an `IS NULL` alternative, so `prio:low,none` is one condition with an `OR` rather than two
   * conditions that would `AND` into nothing. `listBookmarksQuerySchema` accepts only these five
   * literals, and each real level still travels as a parameter.
   *
   * The `decodeURIComponent` that wrapped this and the categories below went with the title's
   * (COS-334) — the same second decode, over two inputs zod constrains to lowercase letters, digits
   * and commas. Neither could throw and neither could change a character: a habit rather than a bug.
   * They are gone all the same, because two spellings of one mistake in one file is how the next
   * reader learns the wrong one. */
  if (priority) {
    const levels = priority.split(",");
    const named = levels.filter((level) => level !== "none");
    const alternatives = [];

    if (named.length > 0) {
      alternatives.push(`b.priority IN (${named.map(() => "?").join(", ")})`);
      conditionParams.push(...named);
    }
    if (levels.includes("none")) {
      alternatives.push("b.priority IS NULL");
    }
    if (alternatives.length > 0) {
      conditions.push(`(${alternatives.join(" OR ")})`);
    }
  }

  // One `EXISTS` per selected category, so a bookmark has to carry them all rather than any
  // of them. The subquery's alias is `bc2`: `bc` would shadow the outer join's.
  if (categories_id) {
    for (const categoryId of categories_id.split(",").map((catId) => parseInt(catId, 10))) {
      conditions.push(
        "EXISTS (SELECT 1 FROM bookmark_category bc2 WHERE b.id = bc2.bookmark_id AND bc2.category_id = ?)",
      );
      conditionParams.push(categoryId);
    }
  }

  /* ⚠️ **`AND c.user_id = b.user_id` is COS-345, and it is what COS-322's scoping does not reach.**
   *
   * The `WHERE` above stops the *rows*: every record here is the session's. The join brings columns
   * back alongside them, and `bookmark_category` has no owner of its own — so a link to another
   * account's category concatenated that account's name and colour into this response. Six such links
   * exist in the live database. Scoping the join is what stops them rendering.
   *
   * **In the join condition, not the `WHERE`**, for the reason `getCategoriesController` spells out at
   * length: at the `WHERE` the outer join turns inner and every untagged record disappears from the
   * index. Here that would be most of it. */
  const commonSQLParts = `
    FROM bookmark b
        LEFT JOIN url u ON b.url_id = u.id
        LEFT JOIN bookmark_category bc ON b.id = bc.bookmark_id
        LEFT JOIN category c ON bc.category_id = c.id AND c.user_id = b.user_id
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

  /* ⚠️ **The page describes itself** (COS-306, the ticket's `{ rows, total, page, pageCount }`).
   *
   * `total_count` alone was the whole answer before, and the pager divided it by a `ROWS_BY_PAGE`
   * written on the front — which meant the page size existed twice: once in the request this
   * controller just honoured, once in a constant that had to agree with it. It did agree, and it was
   * one edit away from not: a client asking for 50 rows would have been paged as if it had asked for
   * 22, and the number it drew would have been wrong rather than absent.
   *
   * So the count is done here, over the `rows` the request actually asked for. `Math.max(1, …)` is
   * for the empty index: zero records is one page showing nothing, not zero pages — `page 00/00`
   * reads as a broken pager, and the URL `?page=0` is a real page either way.
   *
   * `page` is an echo, and it earns its place by being the *validated* one: the number this query
   * used, not the string the caller sent. */
  const pageCount = Math.max(1, Math.ceil(total_count / rows));

  res.json({
    rows: marshallCategories(bookmarks),
    total: total_count,
    page,
    pageCount,
  });
};
