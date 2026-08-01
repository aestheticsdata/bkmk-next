"use client";

import { describeQuery, nextSort, readSort, toIndexHref } from "@components/bookmarks/helpers/indexQuery";
import { IndexExportMenu } from "@components/bookmarks/IndexExportMenu";
import { BlinkCursor } from "@components/ds/BlinkCursor";
import { CommandBar } from "@components/ds/CommandBar";
import { Overline } from "@components/ds/Overline";
import { Button } from "@components/ui/button";
import { INDEX_TEXT } from "@text/index";
import Link from "next/link";

import type { Category } from "@src/schemas/categories";
import type { FiltersQuery } from "@src/schemas/filters";

/* The command bar (COS-299): what is being shown, and the two controls that change how.
 *
 * **The query field and the `filter ⌥F` button are one control drawn twice** (COS-300), which is the
 * handoff's own arrangement: both open the filter modal. The field is the readable form of what is
 * applied, so clicking the thing you are reading to change it needs no explaining; the button is
 * where anyone looks for a filter, and it carries the shortcut.
 *
 * **What the field says is not the handoff's `> tag:demoscene stars:>3`.** That is a query
 * *language*, and inventing one to fill a mockup's text box would be the largest kind of decoration.
 * `describeQuery` prints the filter object that actually exists, in the same shape — `cat:dev
 * stars:1+ prio:high|highest` — so the line is readable, and true. */
function IndexCommandBar({
  query,
  pathname,
  categories,
  shown,
  total,
  onOpenFilters,
}: {
  query: FiltersQuery;
  pathname: string;
  categories: Category[];
  /** Rows on this page — the left half of `rows 22/312`. */
  shown: number;
  total?: number;
  onOpenFilters: () => void;
}) {
  const names = new Map(categories.map((category) => [category.id, category.name]));
  const expression = describeQuery(query, names);
  const sort = readSort(query.sort);

  return (
    <CommandBar>
      <Overline className="shrink-0 text-gr-accent">{INDEX_TEXT.command.query}</Overline>

      {/* The sunken field of the handoff, and it opens the modal (COS-300). `min-w-0` so a long
          expression truncates instead of pushing the sort and the counter off the bar.
          A `<button>` and not a `div` with a handler: it is the second trigger of a dialog, so it has
          to be reachable by keyboard and announce what it does — `aria-label` rather than the
          expression, because "cat:dev stars:1+" is the *value*, not the name of the control.
          `text-left` because a button centres its content and this one holds a line of text. */}
      <button
        type="button"
        onClick={onOpenFilters}
        aria-label={INDEX_TEXT.command.openFilters}
        className="flex h-6.5 min-w-0 flex-1 items-center gap-1.5 overflow-hidden rounded-md border border-gr-border bg-gr-sunk px-2 text-left text-2xs transition-colors duration-120 outline-none inset-shadow-gr-sunk hover:border-gr-border-2 focus-visible:border-gr-accent focus-visible:ring-3 focus-visible:ring-gr-ring"
      >
        <span
          aria-hidden
          className="shrink-0 text-gr-fg-4"
        >
          &gt;
        </span>
        <span className="min-w-0 truncate text-gr-fg-2">{expression || INDEX_TEXT.command.unfiltered}</span>
        <BlinkCursor className="shrink-0 text-gr-accent" />
      </button>

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

        {/* The shortcut is printed in the dimmer ink and hidden from assistive tech: it is a hint
            about the keyboard, not part of the button's name. `⌥F` is `Alt` + `F` — see the listener
            in `BookmarkIndex`, which reads `event.code` because this combination produces `ƒ` on
            macOS rather than a letter. */}
        <Button
          variant="chrome"
          size="chrome"
          onClick={onOpenFilters}
        >
          {INDEX_TEXT.command.filter}
          <span
            aria-hidden
            className="text-gr-fg-4"
          >
            {INDEX_TEXT.command.filterKey}
          </span>
        </Button>

        {/* The way out (COS-333). Beside `filter` because it is the other control that acts on the
            list as a whole, and last because it is the rarer of the two. The handoff draws neither
            this button nor any other export control — bkmk could not export at all. */}
        <IndexExportMenu />
      </div>
    </CommandBar>
  );
}

export { IndexCommandBar };
