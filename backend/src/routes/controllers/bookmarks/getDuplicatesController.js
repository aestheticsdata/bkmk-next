const dbConnection = require("../../../db/dbinitmysql");
const { normaliseUrl } = require("../../../helpers/normaliseUrl");

/* `GET /bookmarks/duplicates?url=…` — is this page already in the index? (COS-308)
 *
 * The create screen's right pane ends on `N duplicate candidates in index · review before commit`.
 * The number was the mockup's own `2`, hard-coded, because nothing anywhere looked: this is the
 * query behind it, and it is also the de-mock of that line (COS-329 §2).
 *
 * **The question is asked on `url.normalised`, and that is the whole point of COS-338.** Before it
 * there was no definition of "the same url" to ask with, which is why this ticket waited on that one.
 * The helper is the same one the import's staging calls, so the two screens cannot disagree about
 * what a duplicate is.
 *
 * ⚠️ **The second tier the ticket describes — same host, close title — is deliberately not here.**
 * Measured on the real index before a line was written: it finds 7 pairs and **all 7 are wrong**. Two
 * different YouTube videos that share a title, a Google search beside its own image results,
 * `Software Engineering Anxiety | Prime Reacts` against `Software Engineering Anxiety` — an index
 * that is 78 % one host is exactly where "same host" stops meaning anything. It also cannot be
 * honest yet: titles are still stored percent-encoded for every imported and legacy row, so the
 * comparison would be run against `Solving%20Distributed%20Systems…`. The owner's call was to ship
 * this tier and reopen the other after DATA 07 (COS-334) decodes the column.
 *
 * **`active = 1`, because deletion is soft** — the same reading `markImportDuplicates`, the index,
 * the alarms and the record all use. A record you deleted is not a reason to refuse a new one.
 *
 * **`count` is the whole answer, `candidates` is a sample of it.** The pane is 340px wide: it can
 * show a few links, and it prints the total beside them. Same shape as the index's `total` over a
 * page of rows.
 */

/** How many candidates travel back. The pane draws one line per candidate under an 11px warning;
 *  more than this is a list, and the screen is a form. */
const CANDIDATE_ROWS = 5;

const CONDITIONS = "b.user_id = ? AND b.active = 1 AND u.normalised = ?";

const COUNT = `
  SELECT COUNT(*) AS total
    FROM bookmark b
    INNER JOIN url u ON u.id = b.url_id
   WHERE ${CONDITIONS}
`;

/* Newest first: a duplicate of something saved last week is a different conversation from a
 * duplicate of something saved in 2019, and the recent one is the one worth seeing. `b.id` breaks
 * the tie because `date_added` is a DATE — two records saved the same day are otherwise unordered.
 *
 * `LIMIT` is written into the statement rather than bound. It is a module constant, not input, and
 * a placeholder there is the one position mysql2 sends as a string. */
const CANDIDATES = `
  SELECT b.id, b.title, u.original AS url, b.date_added AS addedAt
    FROM bookmark b
    INNER JOIN url u ON u.id = b.url_id
   WHERE ${CONDITIONS}
   ORDER BY b.date_added DESC, b.id DESC
   LIMIT ${CANDIDATE_ROWS}
`;

module.exports = async (req, res) => {
  const { normalised } = normaliseUrl(req.validated.query.url);

  /* An empty url has no key and therefore no answer — the field is being typed into. Answered
   * rather than refused: the screen asks on every settled keystroke, and a 400 while someone
   * clears the field would put an error under a form that is simply not filled in yet. */
  if (normalised === null) {
    return res.status(200).json({ count: 0, candidates: [] });
  }

  const conn = await dbConnection();

  try {
    const parameters = [req.user.id, normalised];
    const [[{ total }]] = await conn.execute(COUNT, parameters);
    // Nothing to sample, and the second query would answer the same nothing.
    const [candidates] = total === 0 ? [[]] : await conn.execute(CANDIDATES, parameters);

    return res.status(200).json({ count: Number(total), candidates });
  } catch (e) {
    return res.status(500).json({ msg: `error looking for duplicates : ${e}` });
  } finally {
    await conn.end();
  }
};
