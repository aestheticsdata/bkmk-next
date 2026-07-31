"use client";

import { countedRow, toIndexHref } from "@components/bookmarks/helpers/indexQuery";
import { Card } from "@components/ds/Card";
import { Overline } from "@components/ds/Overline";
import { Segment } from "@components/ds/Segment";
import { cn } from "@lib/utils";
import { INDEX_TEXT } from "@text/index";
import Link from "next/link";

import type { Category } from "@src/schemas/categories";
import type { FiltersQuery } from "@src/schemas/filters";
import type { PriorityFilter } from "@src/schemas/primitives";

/** `prio high` covers `high` **and** `highest`: a shortcut named for the level below the top would
 *  hide the records that matter most. The controller receives both. */
const HIGH_PRIORITY: PriorityFilter[] = ["high", "highest"];

/* The rail (COS-299): what the index is currently cut down to, and every other cut one click away.
 *
 * **Every row is a `<Link>`, not a click handler.** The query lives in the URL, so a category is a
 * different address, and that is what makes middle-click open a filtered index in a tab, the back
 * button undo a filter, and the whole thing work before hydration. `toIndexHref` builds each target
 * from the current query, which is also how a scope survives choosing a category.
 *
 * ⚠️ **Two of the handoff's three blocks are here, and the third is not.** `storage`
 * (`shots 84/312` + gauge, `db 1.4 mb`) needs a screenshot count and a database size; neither is
 * computed anywhere, and both are DATA 05 (COS-310). It is left out rather than mocked — a permanent
 * `0/0` is worse than a block that arrives when it means something. The category counters are the
 * same story and the same ticket — with one honest exception: the current query's `total_count` is a
 * real number, so it is shown against the row that *is* the query (`all` when nothing is filtered, a
 * category when it is the only filter) and nowhere else. See `countedRow`. */
function IndexRail({
  categories,
  query,
  pathname,
  total,
  className,
}: {
  categories: Category[];
  query: FiltersQuery;
  pathname: string;
  total?: number;
  className?: string;
}) {
  const selected = query.categories_id ?? [];
  const counted = countedRow(query);
  const isHighOnly =
    query.priority?.length === HIGH_PRIORITY.length && HIGH_PRIORITY.every((level) => query.priority?.includes(level));

  return (
    /* ⚠️ **The card is not the scroll container — the category list is** (COS-300).
     *
     * It was the card, and that scrolled everything: `INDEX · CAT` slid up under the top edge and the
     * four scopes sat 1500px below the fold on a real index of fifty-three categories, which made four
     * working filters effectively unreachable. So the card is a three-part column now — a fixed
     * caption, the list, a fixed block of scopes — and only the middle part moves. `min-h-0` on the
     * list is what lets a flex child shrink far enough to scroll at all.
     *
     * `overflow-x-hidden` on the list, not `overflow-auto`: nothing in this column is allowed to
     * scroll sideways. Every label truncates, so a horizontal bar could only ever mean something is
     * mis-sized — and it did, at the width the vertical bar takes. `gr-scroll` replaces the native
     * bar; see the utility.
     *
     * ⚠️ **The horizontal padding is on the three children, not on the card, and the scroller keeps a
     * margin on its right.** Both halves were wrong once and in opposite directions:
     *
     * - with `px-3.5` on the *card*, the list's right edge — where the bar is painted — sat 14px inside
     *   the panel, which is on top of the rows. macOS Chrome overlays its thumb instead of reserving a
     *   channel, so the bar covered a row's rounded right corner.
     * - moving the padding in without a margin then put the bar hard against the panel's border, which
     *   reads just as wrong from the other side.
     *
     * So: padding inside the scroller keeps the rows clear of the bar, and `mr-1.5` keeps the bar clear
     * of the border. Measured — 8px between a row's right edge and the bar, 7px between the bar and the
     * panel's border. */
    <Card className={cn("flex flex-col py-4", className)}>
      <Overline className="mb-2 shrink-0 px-5.5">{INDEX_TEXT.rail.categories}</Overline>
      <nav
        aria-label={INDEX_TEXT.rail.categories}
        className="gr-scroll mr-1.5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3.5"
      >
        {/* `grid-cols-1`, not a bare `grid`: Tailwind spells it `repeat(1, minmax(0, 1fr))`, and the
            `0` minimum is what stops the implicit column from being sized by its widest label. It is
            the track half of the `min-w-0` on the row below. */}
        <div className="grid grid-cols-1 gap-px">
          <RailRow
            href={toIndexHref(pathname, query, { categories_id: undefined })}
            label={INDEX_TEXT.rail.all}
            count={counted?.kind === "all" ? total : undefined}
            on={selected.length === 0}
          />
          {categories.map((category) => (
            <RailRow
              key={category.id}
              href={toIndexHref(pathname, query, { categories_id: [category.id] })}
              label={category.name}
              count={counted?.kind === "category" && counted.id === category.id ? total : undefined}
              on={selected.includes(category.id)}
            />
          ))}
        </div>
      </nav>

      {/* `shrink-0`, so the four scopes keep their room whatever the list above does. `px-3.5` here
          rather than on the card — see the note above. */}
      <div className="mt-5 shrink-0 px-3.5">
        <Overline className="mb-2 block px-2">{INDEX_TEXT.rail.scopes}</Overline>
        {/* `grid` rather than a list: four rows of one line each, and the gap is the design's 5px
            rounded to the scale's 4. */}
        <div className="grid gap-1">
          {/* ⚠️ **`stars: 1`, not a `starred` flag of its own** (COS-300). `stars` is a minimum now,
              so "rated at all" is the modal's `1+` segment and this row writes the same filter — one
              concept, one parameter, and the rail and the modal cannot disagree about it. The row is
              lit for any minimum, because any minimum *is* a star filter; clicking it clears
              whatever the modal set rather than stepping down to 1. */}
          <ScopeRow
            href={toIndexHref(pathname, query, { stars: query.stars ? undefined : 1 })}
            label={INDEX_TEXT.rail.starred}
            on={Boolean(query.stars)}
          />
          <ScopeRow
            href={toIndexHref(pathname, query, { alarm: query.alarm === "armed" ? undefined : "armed" })}
            label={INDEX_TEXT.rail.alarm}
            on={query.alarm === "armed"}
          />
          <ScopeRow
            href={toIndexHref(pathname, query, { screenshot: !query.screenshot || undefined })}
            label={INDEX_TEXT.rail.shot}
            on={Boolean(query.screenshot)}
          />
          <ScopeRow
            href={toIndexHref(pathname, query, { priority: isHighOnly ? undefined : HIGH_PRIORITY })}
            label={INDEX_TEXT.rail.priority}
            on={isHighOnly}
          />
        </div>
      </div>
    </Card>
  );
}

/* A category row: name left, count right, and the count column stays 3ch wide whether or not there
 * is a number in it — so the names do not shift when DATA 05 fills them in.
 *
 * `aria-current="page"` is the accessible half of the selected row's fill: a lighter background is
 * not information anyone can hear.
 *
 * ⚠️ **`min-w-0` on the row itself, and it is the fix for a bug that had nothing to do with the
 * scrollbar.** A grid item's automatic minimum size is `min-content`, so this row refused to be
 * narrower than its longest untruncated label: measured at **175.8px inside a 166px track**, overflowing
 * 9.8px to the right, where the card's `overflow-hidden` clipped it. That is what turned `all 1278` into
 * `all 127` — the count was not clipped by the bar, it had been pushed out of the panel. The label's own
 * `min-w-0 flex-1 truncate` could never fire, because the row it lives in was never asked to fit.
 * With the minimum released, the row is exactly the track and the label truncates as designed. */
function RailRow({ href, label, count, on }: { href: string; label: string; count?: number; on: boolean }) {
  return (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className={cn(
        "flex h-6 min-w-0 items-center gap-2 rounded-md px-2 text-2xs transition-colors duration-120 outline-none",
        "focus-visible:ring-3 focus-visible:ring-gr-ring",
        on
          ? "bg-white/34 font-medium text-gr-fg-2 inset-shadow-gr-hair"
          : "text-gr-fg-3 hover:bg-white/20 hover:text-gr-fg",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {/* ⚠️ `min-w`, not `w`: three digits is the handoff's *padding*, not a ceiling. A fixed 3ch box
          clipped a real index of 1290 records to a plausible-looking `127`, and pushed the row wide
          enough to give the rail a horizontal scrollbar. The label truncates instead — a count that
          cannot be read is worse than a name that ends in an ellipsis. */}
      <span className="min-w-[3ch] shrink-0 text-right tabular-nums text-gr-fg-4">
        {count == null ? "" : String(count).padStart(3, "0")}
      </span>
    </Link>
  );
}

/* A scope: the handoff's `[x]` / `[ ]` box, which is a checkbox drawn in text.
 *
 * It is a link like everything else in the rail, and `aria-pressed` would be a lie on an `<a>` —
 * `aria-current` says the same thing about a destination. The brackets are `aria-hidden`: they are
 * the visual state, and the state is already carried. */
function ScopeRow({ href, label, on }: { href: string; label: string; on: boolean }) {
  return (
    <Link
      href={href}
      aria-current={on ? "true" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-0.5 text-2xs transition-colors duration-120 outline-none",
        "focus-visible:ring-3 focus-visible:ring-gr-ring",
        on ? "text-gr-fg" : "text-gr-fg-3 hover:text-gr-fg",
      )}
    >
      <span
        aria-hidden
        className={on ? "text-gr-accent" : "text-gr-fg-4"}
      >
        [{on ? "x" : " "}]
      </span>
      {label}
    </Link>
  );
}

/* Below the fold the rail is gone and the categories come back as a horizontal scroller at the top
 * of the table card — the handoff's `.gr-mobrail`. The scopes do not follow it: four more segments
 * in a row that already scrolls would bury the categories, and the filter modal reaches all four on
 * any width — the `filter ⌥F` button beside this row is how (COS-300).
 *
 * `gr-scroll-none` is the handoff's invisible scrollbar. It stays a scroll container — only the bar is
 * hidden, and the row still scrolls by wheel, drag and keyboard. */
function IndexMobileRail({
  categories,
  query,
  pathname,
  total,
}: {
  categories: Category[];
  query: FiltersQuery;
  pathname: string;
  total?: number;
}) {
  const selected = query.categories_id ?? [];
  const counted = countedRow(query);

  return (
    <nav
      aria-label={INDEX_TEXT.rail.categories}
      className="gr-scroll-none flex shrink-0 gap-1.5 overflow-x-auto border-b border-gr-border bg-gr-panel-2 px-3 py-2.5 @3xl:hidden"
    >
      <Segment
        asChild
        on={selected.length === 0}
      >
        <Link
          href={toIndexHref(pathname, query, { categories_id: undefined })}
          className="h-8 shrink-0"
        >
          {INDEX_TEXT.rail.all}
          {counted?.kind === "all" && total != null && <span className="ml-1.5 opacity-60">{total}</span>}
        </Link>
      </Segment>
      {categories.map((category) => (
        <Segment
          key={category.id}
          asChild
          on={selected.includes(category.id)}
        >
          <Link
            href={toIndexHref(pathname, query, { categories_id: [category.id] })}
            className="h-8 shrink-0"
          >
            {category.name}
          </Link>
        </Segment>
      ))}
    </nav>
  );
}

export { IndexMobileRail, IndexRail };
