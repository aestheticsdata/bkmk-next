-- COS-307 — the import history.
--
-- The import screen's right pane ends on `last import 2026-07-11 · 341 entries · 12 skipped`. That
-- line was hard-coded, and it had to be: nothing recorded that an import had ever happened. No
-- existing column can answer it either — `bookmark.date_added` is a DATE and says nothing about how
-- many rows came in together, and "skipped" has never been written down anywhere at all.
--
-- One row per commit, written by `commitImportController` inside the same transaction as the rows
-- it describes, so the table cannot claim an import that rolled back.
--
-- `ran_at` is a DATETIME where the rest of the schema uses DATE: the pane shows a day, but two
-- imports on the same day have to be ordered, and a DATE would make them a tie broken by nothing.
--
-- `entries` is what was imported, not what was parsed — it is the number the line prints beside the
-- word `entries`, and the two counts together say what became of the file.
--
-- Without this migration: an import answers 500 on `Table 'bkmk.import_run' doesn't exist` and
-- rolls back, so nothing is imported at all, and `GET /bookmarks/import/last` answers 500 too.

CREATE TABLE import_run (
    id       INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id  INT(11) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    entries  INT(11) NOT NULL,
    skipped  INT(11) NOT NULL,
    ran_at   DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
