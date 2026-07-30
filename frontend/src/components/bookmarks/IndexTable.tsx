"use client";

import { isFiltered, nextSort, readSort, toIndexHref } from "@components/bookmarks/helpers/indexQuery";
import { INDEX_COLUMNS, IndexRow } from "@components/bookmarks/IndexRow";
import { Overline } from "@components/ds/Overline";
import { cn } from "@lib/utils";
import { INDEX_TEXT } from "@text/index";
import Link from "next/link";
import { useState } from "react";

import type { Bookmark } from "@src/schemas/bookmarks";
import type { FiltersQuery } from "@src/schemas/filters";
import type { UseMutationResult } from "@tanstack/react-query";

/** The header cells, in grid order, with the backend column each one sorts by.
 *
 *  **Every column sorts**, as the legacy list had it — including `tags`, which needed a server-side
 *  order to exist (`categories_names`, added by COS-299) rather than a header that does nothing. */
const HEADERS: { key: string; label: string; column: string; className?: string }[] = [
  { key: "priority", label: INDEX_TEXT.columns.priority, column: "priority", className: "pl-4" },
  { key: "stars", label: INDEX_TEXT.columns.stars, column: "stars" },
  { key: "title", label: INDEX_TEXT.columns.title, column: "title" },
  { key: "tags", label: INDEX_TEXT.columns.tags, column: "tags" },
  { key: "shot", label: INDEX_TEXT.columns.shot, column: "screenshot" },
  /* Left-aligned like the five before it. The handoff right-aligns this one because its `added` column
     also held the actions; they are out of the flow now, so there is nothing to align to the right and
     one column reading differently from the rest was the only thing that made it look deliberate. */
  { key: "added", label: INDEX_TEXT.columns.added, column: "date" },
];

/* The table (COS-299): the header row, the rows, and the three things that can be there instead.
 *
 * **ARIA table roles over a CSS grid.** The rows have to be a grid — six columns that line up across
 * a scroll container, at 30px each, is what a `<table>` cannot do without fighting it. So the
 * structure is divs and the semantics are put back by hand: `table` → `row` / `rowgroup` → `row` →
 * `cell`, with `aria-sort` on the two headers that carry it. Without the roles this reads as an
 * unlabelled pile of text.
 *
 * **`confirmId` lives here, not in the row.** One row at a time can be awaiting confirmation — asking
 * on a second row cancels the first, which is what makes it impossible to leave a trail of armed
 * deletes behind you. The row is told whether it is the one; it holds no state of its own. The
 * handoff keeps the same single `confirmId`, and UI 11 (COS-320) owns the rest of that flow. */
function IndexTable({
  rows,
  query,
  pathname,
  total,
  isLoading,
  isError,
  isFetching,
  remove,
}: {
  rows: Bookmark[];
  query: FiltersQuery;
  pathname: string;
  total?: number;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  remove: UseMutationResult<unknown, Error, number>;
}) {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const sort = readSort(query.sort);
  const filtered = isFiltered(query);

  return (
    <div
      role="table"
      aria-label={INDEX_TEXT.rail.categories}
      aria-rowcount={total ?? -1}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div
        role="row"
        className={cn(
          "grid h-7 shrink-0 items-center border-b border-gr-border-2 bg-gr-panel-2 @max-3xl:hidden",
          INDEX_COLUMNS,
        )}
      >
        {HEADERS.map((header) => {
          const active = sort.column === header.column;
          return (
            <div
              key={header.key}
              role="columnheader"
              aria-sort={active ? (sort.descending ? "descending" : "ascending") : undefined}
              className={cn("flex items-center gap-1", header.className)}
            >
              <Link
                href={toIndexHref(pathname, query, {
                  sort: nextSort(query.sort, header.column) as FiltersQuery["sort"],
                })}
                className="flex items-center gap-1 rounded-sm outline-none hover:text-gr-fg-2 focus-visible:ring-3 focus-visible:ring-gr-ring"
              >
                <Overline className={active ? "text-gr-fg-2" : undefined}>{header.label}</Overline>
                {/* The arrow marks the sorted column only. Six arrows would say nothing. */}
                {active && (
                  <span
                    aria-hidden
                    className="text-3xs text-gr-accent"
                  >
                    {sort.descending ? INDEX_TEXT.command.descending : INDEX_TEXT.command.ascending}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {/* The only thing on the screen that scrolls its own content: the chrome, the command bar and
          the pager are pinned, as they are in the shell. */}
      <div
        role="rowgroup"
        className={cn(
          "gr-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden transition-opacity duration-120",
          // The page is being replaced: keep the rows, say they are stale. A spinner over a full table
          // is a worse answer than the table you were already reading.
          isFetching && !isLoading && "opacity-60",
        )}
      >
        {isLoading ? (
          <Placeholder>{INDEX_TEXT.states.loading}</Placeholder>
        ) : isError ? (
          <Placeholder tone="danger">{INDEX_TEXT.states.error}</Placeholder>
        ) : rows.length === 0 ? (
          <Placeholder>{filtered ? INDEX_TEXT.states.noMatch : INDEX_TEXT.states.empty}</Placeholder>
        ) : (
          rows.map((bookmark) => (
            <IndexRow
              key={bookmark.id}
              bookmark={bookmark}
              confirming={confirmId === bookmark.id}
              busy={remove.isPending && remove.variables === bookmark.id}
              onAskRemove={() => setConfirmId(bookmark.id)}
              onCancelRemove={() => setConfirmId(null)}
              onConfirmRemove={() => {
                remove.mutate(bookmark.id);
                setConfirmId(null);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

/** Loading, empty and failed all read the same way: one line, centred, in the tertiary ink. A
 *  skeleton of 22 fake rows would be a bigger lie than a word. */
function Placeholder({ children, tone }: { children: string; tone?: "danger" }) {
  return (
    <div
      role="row"
      className="flex h-20 items-center justify-center"
    >
      <Overline
        role="cell"
        className={tone === "danger" ? "text-gr-accent-2" : undefined}
      >
        {children}
      </Overline>
    </div>
  );
}

export { IndexTable };
