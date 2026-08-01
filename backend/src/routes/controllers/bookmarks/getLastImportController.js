const { format } = require("date-fns");
const dbConnection = require("../../../db/dbinitmysql");

const LAST_RUN = `
  SELECT filename, entries, skipped, ran_at
    FROM import_run
   WHERE user_id = ?
   ORDER BY ran_at DESC, id DESC
   LIMIT 1
`;

/* `GET /bookmarks/import/last` — the `last import` line of the import screen's right pane (COS-307).
 *
 * It was a hard-coded string (`last import 2026-07-11 · 341 entries · 12 skipped`, the handoff's own
 * sample) because nothing recorded that an import had happened at all. `import_run` is that record,
 * written by the commit inside its transaction, and this reads the account's most recent row.
 *
 * **An account that has never imported gets `null`, not a zeroed line.** `0 entries · 0 skipped` on
 * a date that never happened is exactly the kind of reading the chrome lost in COS-321; the screen
 * says there is no import instead.
 *
 * `ran_at` is a `DATETIME` and comes back as a date: the pane shows a day, and the time is in the
 * column so that two imports on the same day can be ordered — `id` breaks the tie for two within the
 * same second. The camel-cased answer follows DATA 01's, not the raw columns the older list routes
 * return.
 */
module.exports = async (req, res) => {
  const conn = await dbConnection();

  try {
    const [[run]] = await conn.execute(LAST_RUN, [req.user.id]);

    if (!run) {
      return res.status(200).json({ lastImport: null });
    }

    return res.status(200).json({
      lastImport: {
        filename: run.filename,
        entries: Number(run.entries),
        skipped: Number(run.skipped),
        ranAt: format(run.ran_at, "yyyy-MM-dd"),
      },
    });
  } catch (e) {
    return res.status(500).json({ msg: "error getting last import : " + e });
  } finally {
    await conn.end();
  }
};
