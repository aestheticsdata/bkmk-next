"use client";

import { describeQuery, nextSort, readSort, toIndexHref } from "@components/bookmarks/helpers/indexQuery";
import { BlinkCursor } from "@components/ds/BlinkCursor";
import { CommandBar } from "@components/ds/CommandBar";
import { Overline } from "@components/ds/Overline";
import { INDEX_TEXT } from "@text/index";
import Link from "next/link";

import type { Category } from "@src/schemas/categories";
import type { FiltersQuery } from "@src/schemas/filters";

/* The command bar (COS-299): what is being shown, and the one control that changes how.
 *
 * ⚠️ **The query field is a display, and the `filter ⌥F` button is not here.** The handoff makes both
 * of them open the filter modal — which is UI 04 (COS-300). A button that opens nothing is worse than
 * a button that has not arrived yet, so the field reads out the active query and the button lands
 * with the modal it belongs to. Until then the rail is how the index is filtered, and it filters for
 * real.
 *
 * **What the field says is not the handoff's `> tag:demoscene stars:>3`.** That is a query
 * *language*, and inventing one to fill a mockup's text box would be the largest kind of decoration.
 * `describeQuery` prints the filter object that actually exists, in the same shape — `cat:dev
 * starred prio:high|highest` — so the line is readable, and true. */
function IndexCommandBar({
  query,
  pathname,
  categories,
  shown,
  total,
}: {
  query: FiltersQuery;
  pathname: string;
  categories: Category[];
  /** Rows on this page — the left half of `rows 22/312`. */
  shown: number;
  total?: number;
}) {
  const names = new Map(categories.map((category) => [category.id, category.name]));
  const expression = describeQuery(query, names);
  const sort = readSort(query.sort);

  return (
    <CommandBar>
      <Overline className="shrink-0 text-gr-accent">{INDEX_TEXT.command.query}</Overline>

      {/* The sunken field of the handoff, minus its click. `min-w-0` so a long expression truncates
          instead of pushing the sort and the counter off the bar. */}
      <div className="flex h-6.5 min-w-0 flex-1 items-center gap-1.5 overflow-hidden rounded-md border border-gr-border bg-gr-sunk px-2 text-2xs inset-shadow-gr-sunk">
        <span
          aria-hidden
          className="shrink-0 text-gr-fg-4"
        >
          &gt;
        </span>
        <span className="min-w-0 truncate text-gr-fg-2">{expression || INDEX_TEXT.command.unfiltered}</span>
        <BlinkCursor className="shrink-0 text-gr-accent" />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        {/* Flips the direction of whatever is sorted. Picking the *column* is the table's header row —
            two controls for one thing, but that is the pair the design draws, and a header you can
            click is where anyone looks first. */}
        <Overline className="@max-3xl:hidden">{INDEX_TEXT.command.sort}</Overline>
        <Link
          href={toIndexHref(pathname, query, { sort: nextSort(query.sort, sort.column) as FiltersQuery["sort"] })}
          className="rounded-md text-2xs text-gr-fg-2 outline-none hover:text-gr-fg focus-visible:ring-3 focus-visible:ring-gr-ring @max-3xl:hidden"
        >
          {INDEX_TEXT.sortLabels[sort.column] ?? sort.column}{" "}
          <span aria-hidden>{sort.descending ? INDEX_TEXT.command.descending : INDEX_TEXT.command.ascending}</span>
        </Link>

        <Overline className="@max-3xl:hidden">{INDEX_TEXT.command.rows}</Overline>
        <span className="text-2xs tabular-nums">
          {shown}
          {total != null && <span className="text-gr-fg-4">/{total}</span>}
        </span>
      </div>
    </CommandBar>
  );
}

export { IndexCommandBar };
