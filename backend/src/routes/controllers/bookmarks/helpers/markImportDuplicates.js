/* Which staged entries the index already holds (COS-307).
 *
 * ⚠️ **"Same url" means the same string, and that is an assumed limit, not an oversight.**
 * `url.original` has no normal form: `https://x.com/a`, `http://x.com/a/` and the same address
 * carrying a `?utm_source=` are three different rows today, and this comparison calls them three
 * different bookmarks. DATA 09 (COS-338) is the ticket that brings a normalised url and the backfill
 * that goes with it; taking it first was the alternative, and the owner chose to ship the staging on
 * an exact match and refine the count afterwards. When that helper lands, this file is the one place
 * that changes — the two endpoints ask it the question, they do not answer it themselves.
 *
 * **The index is read once, not once per entry.** A Session Buddy export runs to thousands of lines;
 * a query per line is thousands of round trips, and an `IN (…)` list of thousands of urls is a
 * statement megabytes long. One `SELECT` of the account's urls into a `Set` is a few hundred
 * kilobytes for an index of this size and answers every line in constant time.
 *
 * **`b.active = 1`, because deletion is soft.** A record the account deleted is in no list and on no
 * screen, so re-importing its url is a new bookmark and not a duplicate — the same reading of
 * `active` the index, the alarms and the record all use.
 *
 * **A file that repeats itself repeats it here too.** The set grows as the entries are walked, so the
 * second occurrence of a url inside one file is a duplicate of the first. An export taken twice and
 * concatenated is the common case, and calling both copies new would be a promise that `skip
 * duplicates` cannot keep.
 */

const STATES = { new: "NEW", duplicate: "DUP" };

const EXISTING_URLS = `
  SELECT u.original
    FROM bookmark b
    INNER JOIN url u ON u.id = b.url_id
   WHERE b.user_id = ? AND b.active = 1
`;

/** `{ entries, fresh, duplicates }` — the entries with a `state`, and the two halves of the
 *  handoff's summary. */
async function markImportDuplicates(conn, userID, entries) {
  const [rows] = await conn.execute(EXISTING_URLS, [userID]);
  const known = new Set(rows.map((row) => row.original));

  let fresh = 0;
  let duplicates = 0;

  const marked = entries.map((entry) => {
    if (known.has(entry.link)) {
      duplicates += 1;
      return { ...entry, state: STATES.duplicate };
    }

    known.add(entry.link);
    fresh += 1;
    return { ...entry, state: STATES.new };
  });

  return { entries: marked, fresh, duplicates };
}

module.exports = { markImportDuplicates, STATES };
