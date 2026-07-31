"use client";

import { Overline } from "@components/ds/Overline";
import { IMPORT_TEXT } from "@text/import";

import type { ParseResult } from "@components/bookmarks/import/parseImport";

/** The handoff's `1fr 190px 74px`, on the spacing scale: 47.5 and 18.5 steps. Below the fold the
 *  host column goes and the table is title + state, which is the ticket's own instruction. */
const STAGED_COLUMNS = "grid-cols-[1fr_--spacing(47.5)_--spacing(18.5)] @max-3xl:grid-cols-[1fr_auto]";

/** How many rows are drawn. A Session Buddy export runs to thousands of lines and the table is a
 *  sample, not the file — the summary under it is what carries the totals.
 *
 *  ⚠️ **The cap is said out loud** when it bites: a table that stops at two hundred without a word
 *  reads as a file that had two hundred entries. */
const MAX_ROWS = 200;

/* `staged` (COS-303) — what is in the file, before it is sent.
 *
 * **The rows are real.** `title` and `host` come from parsing the dropped file in the browser, and
 * so do `parsed` and `malformed` in the summary — see `parseImport.ts` for why that parser exists
 * twice and what removes it.
 *
 * ⚠️ **The `state` column and the `new` / `duplicate` halves of the summary are mocked — COS-307.**
 * Nothing looks for duplicates: there is no query that asks the index whether a url is already in
 * it. Every row therefore reads `NEW` and the summary reads `0 duplicate`, which is what an unrun
 * check yields rather than a claim that the file is clean. `DUP`, which the handoff draws in oxide
 * on one of its five rows, appears nowhere until that endpoint does.
 *
 * ARIA table roles over a CSS grid, the index table's arrangement and for its reason: columns that
 * line up across a scroll container is what a `<table>` cannot do without a fight — a scrolling
 * `<tbody>` needs `display: block`, and that is exactly what stops it agreeing with its `<thead>`.
 * So the structure is divs and the semantics are put back by hand. `biome.json` turns
 * `useSemanticElements` and `useFocusableInteractive` off for this file and for the index's, which
 * is the only place that exemption is granted. */
function ImportStaged({ filename, parsed }: { filename: string; parsed: ParseResult }) {
  const rows = parsed.entries.slice(0, MAX_ROWS);
  const hidden = parsed.entries.length - rows.length;

  return (
    <div className="grid gap-2">
      <Overline className="block">{IMPORT_TEXT.sections.staged(filename)}</Overline>

      <div
        role="table"
        aria-label={IMPORT_TEXT.aria.table}
        aria-rowcount={parsed.entries.length}
        className="overflow-hidden rounded-lg border border-gr-border"
      >
        <div
          role="row"
          className={`grid h-7 items-center border-b border-gr-border-2 bg-gr-panel-2 ${STAGED_COLUMNS}`}
        >
          <Overline
            role="columnheader"
            className="pl-3.5"
          >
            {IMPORT_TEXT.columns.title}
          </Overline>
          <Overline
            role="columnheader"
            className="@max-3xl:hidden"
          >
            {IMPORT_TEXT.columns.host}
          </Overline>
          <Overline
            role="columnheader"
            className="pr-3.5 text-right"
          >
            {IMPORT_TEXT.columns.state}
          </Overline>
        </div>

        {/* Its own scroller rather than growing the card: two hundred rows at 30px is 6000, and the
            summary under the table has to stay reachable without scrolling past all of them. */}
        <div
          role="rowgroup"
          className="gr-scroll max-h-90 overflow-y-auto"
        >
          {rows.map((entry) => (
            <div
              key={entry.at}
              role="row"
              className={`grid h-7.5 items-center border-b border-gr-border/60 last:border-b-0 ${STAGED_COLUMNS}`}
            >
              <div
                role="cell"
                className="truncate pl-3.5 text-xs text-gr-fg-2"
              >
                {entry.title}
              </div>
              <div
                role="cell"
                className="truncate text-2xs text-gr-fg-3 @max-3xl:hidden"
              >
                {entry.host ?? IMPORT_TEXT.states.noHost}
              </div>
              {/* ⚠️ Mock — COS-307. Teal because every row is new; the oxide `DUP` has no source. */}
              <div
                role="cell"
                className="pr-3.5 text-right text-3xs uppercase tracking-caps text-gr-accent"
              >
                {IMPORT_TEXT.mock.state}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-2">
        <Overline>
          {IMPORT_TEXT.summary(
            parsed.entries.length,
            parsed.entries.length,
            // ⚠️ Mock — COS-307. The other three numbers are counted from the file.
            IMPORT_TEXT.mock.duplicates,
            parsed.malformed,
          )}
        </Overline>
        {hidden > 0 && <Overline className="text-gr-fg-4">{IMPORT_TEXT.states.more(hidden)}</Overline>}
      </div>
    </div>
  );
}

export { ImportStaged };
