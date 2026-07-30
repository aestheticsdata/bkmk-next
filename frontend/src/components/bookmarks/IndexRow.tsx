"use client";

import { tagHue } from "@components/bookmarks/helpers/tagHue";
import { Chip } from "@components/ds/Chip";
import { MiniButton } from "@components/ds/MiniButton";
import { Overline } from "@components/ds/Overline";
import { PriorityBars } from "@components/ds/PriorityBars";
import { RowAction, RowActions } from "@components/ds/RowActions";
import { Stars } from "@components/ds/Stars";
import { ROUTES } from "@components/shared/config/constants";
import { cn } from "@lib/utils";
import { INDEX_TEXT } from "@text/index";
import { format } from "date-fns";
import Link from "next/link";

import type { Bookmark } from "@src/schemas/bookmarks";

/** The columns, in 4px steps: `pri 36 · stars 62 · title 1fr · tags 188 · shot 44 · added 88`, with an
 *  8px gutter between them.
 *
 *  ⚠️ **Three departures from the handoff's `58 36 62 1fr 188 168`, and each was a defect on screen.**
 *
 *  Its leading 58px is `id`, which the owner took out — a database key among titles and dates,
 *  unsortable, and absent from the legacy list too. The 44px `shot` column takes its place, back from
 *  that legacy list.
 *
 *  `gap-x-2`: the handoff butts its columns together, and at these widths `PRI` filled its 36px and
 *  `STARS` began at the next pixel — the header read `PRISTARS`, and the bars touched the stars below
 *  it. Eight pixels is the smallest gutter that separates them; the `1fr` title absorbs the six of
 *  them.
 *
 *  And `added` is 88px rather than 168: 168 was the date **plus room for the three actions**, which no
 *  longer stand in the flow — see the strip below. What was left was 70px of blank column with nothing
 *  in it.
 *
 *  Exported because the header row must use the identical string: two grids that agree by accident
 *  drift the first time one is edited. */
const INDEX_COLUMNS =
  "grid-cols-[--spacing(9)_--spacing(15.5)_1fr_--spacing(47)_--spacing(11)_--spacing(22)] gap-x-2 @max-3xl:grid-cols-1";

/** Three at most, as the handoff draws. A fourth would push the column, and the record screen shows
 *  them all. */
const MAX_CHIPS = 3;

/* One row of the index (COS-299). 30px tall — the density *is* the design; do not air it out.
 *
 * ⚠️ **How the whole row can be clicked without the row being a control.** The title is a real
 * `<Link>` whose `::after` covers the row (`after:absolute after:inset-0`), so the click target is
 * the row and the thing being clicked is still an anchor: Enter opens it, ⌘-click opens a tab, the
 * status bar shows where it goes, and no `div` needs a keyboard handler bolted on. The handoff's
 * `onClick` on a `div` plus `stopPropagation` on every button is the same effect built the way that
 * fails a screen reader — and the spec (§ lint) asks for the keyboard from this ticket on.
 *
 * The actions then sit **above** that overlay (`relative z-1`), which is why none of them needs
 * `stopPropagation`: the buttons are in front of the link, not inside it. Nested interactive elements
 * inside an anchor would be invalid markup anyway.
 *
 * `group/row` is the named group `ds/RowActions` reveals itself with. */
function IndexRow({
  bookmark,
  selected = false,
  confirming,
  onAskRemove,
  onCancelRemove,
  onConfirmRemove,
  busy = false,
}: {
  bookmark: Bookmark;
  selected?: boolean;
  confirming: boolean;
  onAskRemove: () => void;
  onCancelRemove: () => void;
  onConfirmRemove: () => void;
  busy?: boolean;
}) {
  const title = decodeURIComponent(bookmark.title);
  const url = bookmark.original_url ?? undefined;

  return (
    <div
      data-slot="index-row"
      role="row"
      className={cn(
        "group/row relative grid h-7.5 items-center border-b border-gr-border text-2xs transition-colors duration-120",
        INDEX_COLUMNS,
        "@max-3xl:h-auto @max-3xl:gap-1 @max-3xl:px-3 @max-3xl:py-2",
        selected ? "bg-white/36 inset-shadow-gr-mark" : "hover:bg-white/20",
      )}
    >
      {/* `pl-4` rides the first column, whichever it is — it is the card's left margin, not `pri`'s. */}
      <div
        role="cell"
        className="pl-4 @max-3xl:hidden"
      >
        <PriorityBars p={bookmark.priority ?? ""} />
      </div>

      <div
        role="cell"
        className="@max-3xl:hidden"
      >
        <Stars n={bookmark.stars} />
      </div>

      <div
        role="cell"
        className="flex min-w-0 items-center gap-2.5"
      >
        {/* The link that covers the row. `truncate` on the anchor keeps a long title from pushing the
            url out of the cell. */}
        <Link
          href={`${ROUTES.bookmarks.path}/${bookmark.id}`}
          className="min-w-0 truncate rounded-sm text-gr-fg-2 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-3 focus-visible:ring-gr-ring"
        >
          {title}
        </Link>
        {bookmark.alarm_id != null && (
          <span
            title={INDEX_TEXT.row.hasAlarm}
            aria-label={INDEX_TEXT.row.hasAlarm}
            role="img"
            className="shrink-0 text-gr-accent"
          >
            ◔
          </span>
        )}
        {url && <span className="min-w-0 truncate text-3xs text-gr-fg-3">{url.replace(/^https?:\/\//, "")}</span>}
      </div>

      <div
        role="cell"
        className="flex gap-1.5 overflow-hidden @max-3xl:hidden"
      >
        {bookmark.categories.slice(0, MAX_CHIPS).map((category) => (
          <Chip
            key={category.id}
            hue={tagHue(category)}
          >
            {category.name}
          </Chip>
        ))}
      </div>

      {/* Its own column, from the legacy list: a strip you can read straight down, and sortable from
          the header. Empty when there is none — an "absent" glyph would be noise on most rows. */}
      <div
        role="cell"
        className="@max-3xl:hidden"
      >
        {bookmark.screenshot && (
          <span
            title={INDEX_TEXT.row.hasShot}
            aria-label={INDEX_TEXT.row.hasShot}
            role="img"
            className="text-gr-fg-4"
          >
            ◨
          </span>
        )}
      </div>

      {/* **The date, left-aligned like every other column — and the actions are not in this cell.**
          They are an absolute strip against the row (below), so the column is the width of a date and
          nothing more. It carried 70px of blank space when the three buttons stood in the flow.
          Hidden while a delete is being confirmed, and while the row is hovered, because that is when
          the strip is over it: hovering swaps the date for the actions in place, which is the whole
          reason there is no dead column left. */}
      <div
        role="cell"
        className={cn(
          "text-3xs text-gr-fg-3 tabular-nums transition-opacity duration-120 @max-3xl:hidden",
          confirming ? "opacity-0" : "group-hover/row:opacity-0 group-focus-within/row:opacity-0",
        )}
      >
        {bookmark.date_added && format(bookmark.date_added, "yyyy-MM-dd")}
      </div>

      {/* Out of the flow, pinned to the row's right edge — `absolute` resolves against the row, which
          is the `relative` one. Inside the last cell rather than beside it, so the row keeps six cells
          and its ARIA structure. `z-1` puts it above the title link's overlay, which is why none of
          these handlers needs `stopPropagation`. */}
      <div className="absolute inset-y-0 right-3 z-1 flex items-center gap-2">
        {confirming ? (
          <>
            <Overline className="text-gr-accent-2">{INDEX_TEXT.row.askRemove}</Overline>
            <MiniButton
              danger
              disabled={busy}
              onClick={onConfirmRemove}
              className="hover:translate-y-0"
            >
              {INDEX_TEXT.row.confirm}
            </MiniButton>
            <MiniButton
              onClick={onCancelRemove}
              className="hover:translate-y-0"
            >
              {INDEX_TEXT.row.cancel}
            </MiniButton>
          </>
        ) : (
          <RowActions>
            {/* ⚠️ **Three actions, always — the third is `disabled` when there is no url.** A record
                with no url used to render two, and while the strip stood in the flow that shifted those
                rows' dates by exactly one button. It no longer can, and the rule stays: the strip is a
                fixed shape, hovering a row must not resize anything. */}
            {url ? (
              <RowAction
                asChild
                title={INDEX_TEXT.row.open}
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener"
                  aria-label={INDEX_TEXT.row.open}
                >
                  ↗
                </a>
              </RowAction>
            ) : (
              <RowAction
                disabled
                aria-label={INDEX_TEXT.row.noUrl}
                title={INDEX_TEXT.row.noUrl}
                className="opacity-40"
              >
                ↗
              </RowAction>
            )}
            {/* Edit is the modal of UI 10 (COS-319); until it exists this is the edit screen that
                exists today, so the action works rather than waiting. */}
            <RowAction
              asChild
              title={INDEX_TEXT.row.edit}
            >
              <Link
                href={`${ROUTES.bookmarksEdition.path}/${bookmark.id}`}
                aria-label={INDEX_TEXT.row.edit}
              >
                ✎
              </Link>
            </RowAction>
            <RowAction
              danger
              title={INDEX_TEXT.row.remove}
              aria-label={INDEX_TEXT.row.remove}
              onClick={onAskRemove}
            >
              ⌧
            </RowAction>
          </RowActions>
        )}
      </div>
    </div>
  );
}

export { INDEX_COLUMNS, IndexRow, MAX_CHIPS };
