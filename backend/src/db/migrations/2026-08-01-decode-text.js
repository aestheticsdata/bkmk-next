/* COS-334 — the text in the column, as it was typed.
 *
 * `bookmark.title` and `bookmark.notes` were stored percent-encoded, and not everywhere nor the same
 * way. The legacy create form encoded every field it sent; the importer wrote
 * `encodeURIComponent(anyASCII(title))`; the GRAPHITE insert screen stored the title raw and encoded
 * only the notes. One column, three conventions. Meanwhile the index compared the search input
 * against it decoded — so `%session buddy%` was matched against `session%20buddy`, and any search
 * containing a space missed the imported rows, which are most of the index. Seven screens called a
 * forgiving decode to undo the encoding on the way out, and the export grew a `textEncoding` field to
 * say so in the file.
 *
 * This is the pass that makes the column mean one thing. The encodes are gone from the write paths
 * and the decodes from the read paths in the same change; this brings the rows already there into
 * line with both.
 *
 * **A `.js` and not a `.sql`, and this is the second file of the kind.** MySQL has no url decoder —
 * no `URLDECODE`, nothing in `information_schema`, and `REPLACE(title, '%20', ' ')` chained forty
 * times is not the same function. It is the reason PLAT 06 was taken before this ticket.
 *
 * ⚠️ **One decode. Never a loop, and the index holds the proof.** `bookmark 1` is a note whose text
 * contains a LinkedIn url, and that url carries its own escapes in its query string —
 * `?trackingId=…%2F…%3D%3D`. Stored, it reads `%252F` and `%253D%253D`: one
 * encoding of a string that already had escapes in it, not two encodings. One pass returns the note
 * as it was typed, url intact. A second pass would eat the url's own escaping and hand back a broken
 * link. "Decode until it stops changing" is therefore wrong, and it is wrong on real data rather
 * than in principle.
 *
 * ⚠️ **A value holding a literal space was written raw, and is left alone.** `encodeURIComponent`
 * turns a space into `%20`, so it cannot produce one — a stored value with a space in it came from
 * the insert screen or from an import since COS-307, and decoding it would eat a `%20` its author
 * typed. On the dev index, **before** the run, 137 values carried a space and not one of them would
 * have been rewritten without this clause — it protected nothing. **After** the run, 1 310 carry one,
 * and the clause is now what stands between two of them and a second pass that would corrupt them:
 * the LinkedIn note above, and `bookmark 275` below. The run prints both counts as it goes, so the
 * clause reports whether it is doing anything rather than being taken on trust.
 *
 * That is also what makes the file safe to run twice — the second time it finds 0 values to rewrite —
 * which matters because the runner records nothing for a file that failed, so a rerun after a failure
 * starts from the top.
 *
 * ⚠️ **A value whose decode throws is left alone too, and the two guards overlap on purpose.**
 * `decodeURIComponent` throws on a `%` that is not an escape, which is what the `try/catch` in
 * `frontend/helpers/decodeNote` existed for. The index holds exactly one such value, and it is worth
 * following because it is the same lesson as the note above wearing different clothes. `bookmark 275`
 * was stored `YouTube%20to%20Mp3%20Converter%20(up%20to%20320kbps)%20%5B100%25%20Working%5D`, decodes
 * cleanly once to `YouTube to Mp3 Converter (up to 320kbps) [100% Working]`, and **throws on a second
 * pass** — `%20W` is not an escape. So it is a row this file rewrites, and from the moment it has, it
 * is a row this file must never touch again. The space clause reaches it first and the `catch` would
 * have reached it second; the tally below counts only what got past the first, which is why it reads
 * 0 rather than 1.
 *
 * ⚠️ **One transaction, and this is the migration that can have one.** `migrate.js` deliberately does
 * not wrap a file, because MySQL will not give it one: DDL commits implicitly, and an `ALTER TABLE`
 * inside a transaction ends it. This file has no DDL at all — it is 1 177 `UPDATE`s — so it takes its
 * own. Half a decoded index is the bad outcome here: the rows would be readable, nothing would fail,
 * and there would be no way to tell which half had landed.
 *
 * **Without this migration:** nothing answers 500 — this is data, not a column. What happens instead
 * is that every imported and legacy row displays its own escaping, on every screen: the index reads
 * `Framework%20reimagined`, the record screen the same, the note keeps its `%0A` instead of a line
 * break, and the export writes it into all three files. The decodes that used to hide it were removed
 * with this ticket. Searching stays broken in the other direction, too: the query is raw now, so it
 * misses the encoded rows.
 */

/** The two columns, in the order the log prints them. Interpolated into the `UPDATE` below, which is
 *  safe for the same reason `getBookmarksController` interpolates its `ORDER BY`: these are literals
 *  written in this file, never anything that arrived from a request. */
const COLUMNS = ["title", "notes"];

/** `encodeURIComponent` cannot emit one of these — a space becomes `%20`, a newline `%0A`. Finding
 *  one in the stored value is how a raw row identifies itself. */
const RAW_MARKERS = /[ \t\n\r]/;

/* What is to be done with one value — one of four answers, and the three that are not `decode` are
 * the three warnings in the header, in the order they are cheapest to test: it was written raw, it is
 * not an encoding of anything, or decoding it changes nothing at all.
 *
 * A verdict rather than a value-or-null, because the run has to be able to say how many rows each
 * clause protected. A number nobody can break down is a number nobody can check. */
const classify = (value) => {
  if (RAW_MARKERS.test(value)) return { verdict: "raw", wouldHaveChanged: wouldChange(value) };

  try {
    const decoded = decodeURIComponent(value);
    return decoded === value ? { verdict: "plain" } : { verdict: "decode", decoded };
  } catch {
    return { verdict: "throws" };
  }
};

/** Whether the space clause is the only thing standing between this value and a rewrite — reported so
 *  that "137 written raw" can be read as the guard doing nothing rather than as 137 rows dodged. On
 *  the dev index the answer is `false` every time, which is what makes that clause a guard for what
 *  comes next rather than a repair of what is there. */
function wouldChange(value) {
  try {
    return decodeURIComponent(value) !== value;
  } catch {
    return false;
  }
}

/** A value on one line of the log, cut so that a 3 000-character note does not bury the 1 176 rows
 *  under it. Newlines are shown as `\n` for the same reason. */
const short = (value) => {
  const oneLine = value.replaceAll("\n", "\\n").replaceAll("\r", "\\r");
  return oneLine.length > 90 ? `${oneLine.slice(0, 90)}…` : oneLine;
};

const migration = async (conn, { dryRun = false } = {}) => {
  /* Every row, active or not. Deletion here is soft, and a column that means one thing for the rows
   * the index shows and another for the rows it hides is the defect this file is closing. 4 of the
   * dev index's encoded notes are on retired records. */
  const [rows] = await conn.query("SELECT id, title, notes FROM bookmark");

  const changes = [];
  const left = { raw: 0, throws: 0, plain: 0 };
  let rawThatWouldHaveChanged = 0;

  for (const row of rows) {
    for (const column of COLUMNS) {
      const value = row[column];
      if (!value) continue;

      const { verdict, decoded, wouldHaveChanged } = classify(value);
      if (verdict === "decode") {
        changes.push({ id: row.id, column, from: value, to: decoded });
        continue;
      }

      left[verdict] += 1;
      if (wouldHaveChanged) rawThatWouldHaveChanged += 1;
    }
  }

  console.log(`  ${rows.length} rows read, ${changes.length} values to rewrite`);
  console.log(`  left alone: ${left.raw} written raw, ${left.throws} that do not decode, ${left.plain} already plain`);
  console.log(
    `  of the ${left.raw} written raw, ${rawThatWouldHaveChanged} would have been rewritten without that clause`,
  );

  if (dryRun) {
    for (const change of changes) {
      console.log(`  ${String(change.id).padStart(6)}  ${change.column}`);
      console.log(`          − ${short(change.from)}`);
      console.log(`          + ${short(change.to)}`);
    }
    return;
  }

  await conn.beginTransaction();
  try {
    for (const change of changes) {
      await conn.execute(`UPDATE bookmark SET ${change.column}=? WHERE id=?`, [change.to, change.id]);
    }
    await conn.commit();
  } catch (error) {
    await conn.rollback().catch(() => {});
    throw error;
  }

  console.log(`  rewrote ${changes.length} values in one transaction`);
};

/** ⚠️ **The opt-in `migrate.js dry-run` refuses to run without.** See the note on that command: a
 *  preview of a migration that ignores the flag is a full apply. */
migration.dryRun = true;

module.exports = migration;
