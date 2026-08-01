const { normaliseUrl } = require("../../helpers/normaliseUrl");

/* COS-338 — the url's normal form, its host, and the rows nothing points at.
 *
 * `url` held three columns and no rule. `original` was inserted unconditionally by every write path,
 * deleted outright when a record's url was cleared, and left behind when a record was retired; there
 * was no key two urls could be compared on, which is the dependency COS-307 assumed and COS-308 still
 * needs. This adds the key as a column — see `helpers/normaliseUrl.js` for what it contains and why
 * it is stored rather than computed — fills it, and clears out what the missing rule left.
 *
 * **A `.js` and not a `.sql`, and this is the case the runner was built for.** MySQL cannot parse a
 * url: there is no function that reads a host out of one, drops a `?utm_source=` or tells a trailing
 * slash from a path. The backfill is the same JavaScript the controllers call, run once over the
 * table, so the rows written before this and the rows written after it hold the same key.
 *
 * ⚠️ **The sweep goes first, and it only removes rows nothing points at.** 2 685 of the dev index's
 * 3 928 `url` rows — 68 % — were reachable from no bookmark at all, which is what "inserted
 * unconditionally, with no transaction around it" produces over three years. What it deliberately
 * does *not* touch is a row whose only bookmark is inactive: deletion here is soft, and dropping the
 * url of a retired record would make that one deletion permanent. The foreign key would refuse it
 * anyway, which is the schema saying the same thing.
 *
 * ⚠️ **No `UNIQUE` on `normalised`, and that is a decision, not an omission.** The ticket asks the
 * question and the table answers it: `url` has no `user_id`. A unique key would force two accounts
 * that bookmark the same page onto one row, and `editBookmarkController` updates that row in place —
 * so saving your record would silently rewrite a stranger's. "The same url" is a question that is
 * only ever asked inside one account (`markImportDuplicates` scopes it, and so will COS-308), so the
 * index here is a plain one: it makes the lookup fast, and ownership stays where it is.
 *
 * ⚠️ **Prefix index.** `normalised` is `VARCHAR(2048)` and InnoDB stops at 3 072 bytes for a key, so
 * 255 characters of utf8mb4 (1 020 bytes) is what is indexed. Two urls identical for 255 characters
 * land in the same bucket and are then compared in full, which is what a prefix index is for.
 *
 * **Without this migration:** every write to `url` names the two new columns, so creating a bookmark,
 * saving one and committing an import all answer 500 on `Unknown column 'normalised' in 'field
 * list'`, and the import's duplicate count reads the same column.
 */

const hasColumn = async (conn, table, column) => {
  const [[row]] = await conn.execute(
    `SELECT COUNT(*) AS n FROM information_schema.columns
      WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column],
  );
  return Number(row.n) > 0;
};

const hasIndex = async (conn, table, index) => {
  const [[row]] = await conn.execute(
    `SELECT COUNT(*) AS n FROM information_schema.statistics
      WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
    [table, index],
  );
  return Number(row.n) > 0;
};

/* Each step asks whether it has already happened.
 *
 * The runner has no transaction to give — MySQL commits DDL implicitly — so it stops at the first
 * failure and records nothing for the file. A second run after a failure therefore starts from the
 * top, and every step here is written to be a no-op when it is already done. */
module.exports = async (conn) => {
  const [swept] = await conn.execute(`
    DELETE u FROM url u
      LEFT JOIN bookmark b ON b.url_id = u.id
     WHERE b.id IS NULL
  `);
  console.log(`  swept ${swept.affectedRows} url rows no bookmark points at`);

  if (!(await hasColumn(conn, "url", "normalised"))) {
    await conn.query("ALTER TABLE url ADD COLUMN normalised VARCHAR(2048) NULL AFTER original");
    console.log("  added url.normalised");
  }

  if (!(await hasColumn(conn, "url", "host"))) {
    await conn.query("ALTER TABLE url ADD COLUMN host VARCHAR(255) NULL AFTER normalised");
    console.log("  added url.host");
  }

  const [rows] = await conn.query("SELECT id, original FROM url WHERE normalised IS NULL");
  let filled = 0;
  for (const row of rows) {
    const { normalised, host } = normaliseUrl(row.original);
    await conn.execute("UPDATE url SET normalised=?, host=? WHERE id=?", [normalised, host, row.id]);
    filled += 1;
  }
  console.log(`  filled ${filled} rows`);

  if (!(await hasIndex(conn, "url", "url_normalised"))) {
    await conn.query("CREATE INDEX url_normalised ON url (normalised(255))");
    console.log("  indexed url.normalised");
  }

  if (!(await hasIndex(conn, "url", "url_host"))) {
    await conn.query("CREATE INDEX url_host ON url (host)");
    console.log("  indexed url.host");
  }
};
