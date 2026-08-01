/* Which staged entries the index already holds (COS-307).
 *
 * ⚠️ **"Same url" is the normal form now, and this is the one file that changed for it (COS-338).**
 * It used to be the exact string, an assumed limit written down here rather than hidden: `url` had no
 * normal form, so `https://x.com/a`, `http://x.com/a/` and the same address carrying a
 * `?utm_source=` were three rows and three different bookmarks. `helpers/normaliseUrl` is the
 * definition, `url.normalised` is where it is kept, and the comparison below reads that column
 * against the key the parse computed for each entry. The two endpoints still only ask the question —
 * they do not answer it themselves, which is what made this a one-file change.
 *
 * **What that is worth, measured on the real index: one pair.** The rows already in the database were
 * written by paths that never varied a url's shape on their own. The gain is on what comes *next* —
 * 1 075 of 1 237 rows carry `www.` and 57 a trailing slash, so an export of the same pages taken from
 * a different browser used to arrive as entirely new entries.
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
  SELECT u.normalised
    FROM bookmark b
    INNER JOIN url u ON u.id = b.url_id
   WHERE b.user_id = ? AND b.active = 1
`;

/** `{ entries, fresh, duplicates }` — the entries with a `state`, and the two halves of the
 *  handoff's summary. */
async function markImportDuplicates(conn, userID, entries) {
  const [rows] = await conn.execute(EXISTING_URLS, [userID]);
  // `normalised` is NULL only for a row whose `original` is blank, which no write path produces —
  // and no entry could match it anyway, since a line without a link never becomes an entry. Dropped
  // rather than trusted: a `Set` holding `null` would call such a row a duplicate of nothing.
  const known = new Set(rows.map((row) => row.normalised).filter((key) => key !== null));

  let fresh = 0;
  let duplicates = 0;

  const marked = entries.map((entry) => {
    if (known.has(entry.normalised)) {
      duplicates += 1;
      return { ...entry, state: STATES.duplicate };
    }

    known.add(entry.normalised);
    fresh += 1;
    return { ...entry, state: STATES.new };
  });

  return { entries: marked, fresh, duplicates };
}

module.exports = { markImportDuplicates, STATES };
