"use client";

import { Overline } from "@components/ds/Overline";
import { IMPORT_TEXT } from "@text/import";

import type { ImportParseResponse } from "@src/schemas/import";

/** The handoff's `1fr 190px 74px`, on the spacing scale: 47.5 and 18.5 steps. Below the fold the
 *  host column goes and the table is title + state, which is the ticket's own instruction. */
const STAGED_COLUMNS = "grid-cols-[1fr_--spacing(47.5)_--spacing(18.5)] @max-3xl:grid-cols-[1fr_auto]";

/* `staged` (COS-303, de-mocked by COS-307) — what is in the file, before it is sent.
 *
 * ⚠️ **The `state` column and the whole summary are the API's answer now.** Every row used to read
 * `NEW` and the summary `0 duplicate`, because nothing looked: `POST /bookmarks/import/parse` is
 * what looks, and `DUP` — drawn in oxide, as the handoff draws it on one of its five rows — is a url
 * the account's index already holds. What counts as "already holds" is an exact match on the stored
 * url until COS-338 normalises them; `markImportDuplicates` carries that limit and the reasoning.
 *
 * ⚠️ **The row cap moved to the server with the parse.** The table draws what arrives and the
 * endpoint sends two hundred at most; `summary.parsed` is the whole file, so the difference between
 * the two is the `N more not listed` under it. One side decides, and it is the side that has the
 * file.
 *
 * ARIA table roles over a CSS grid, the index table's arrangement and for its reason: columns that
 * line up across a scroll container is what a `<table>` cannot do without a fight — a scrolling
 * `<tbody>` needs `display: block`, and that is exactly what stops it agreeing with its `<thead>`.
 * So the structure is divs and the semantics are put back by hand. `biome.json` turns
 * `useSemanticElements` and `useFocusableInteractive` off for this file and for the index's, which
 * is the only place that exemption is granted. */
function ImportStaged({ filename, staged }: { filename: string; staged: ImportParseResponse }) {
  const { entries, summary } = staged;
  const hidden = summary.parsed - entries.length;

  return (
    <div className="grid gap-2">
      <Overline className="block">{IMPORT_TEXT.sections.staged(filename)}</Overline>

      <div
        role="table"
        aria-label={IMPORT_TEXT.aria.table}
        aria-rowcount={summary.parsed}
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
          {entries.map((entry) => {
            const duplicate = entry.state === "DUP";

            return (
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
                <div
                  role="cell"
                  className={`pr-3.5 text-right text-3xs uppercase tracking-caps ${
                    duplicate ? "text-gr-accent-2" : "text-gr-accent"
                  }`}
                >
                  {duplicate ? IMPORT_TEXT.states.duplicate : IMPORT_TEXT.states.new}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-2">
        <Overline>{IMPORT_TEXT.summary(summary.parsed, summary.new, summary.duplicates, summary.malformed)}</Overline>
        {hidden > 0 && <Overline className="text-gr-fg-4">{IMPORT_TEXT.states.more(hidden)}</Overline>}
      </div>
    </div>
  );
}

export { ImportStaged };
