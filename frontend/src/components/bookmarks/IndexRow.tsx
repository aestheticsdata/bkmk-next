"use client";

import { tagHue } from "@components/bookmarks/helpers/tagHue";
import { Chip } from "@components/ds/Chip";
import { MiniButton } from "@components/ds/MiniButton";
import { Overline } from "@components/ds/Overline";
import { PriorityBars } from "@components/ds/PriorityBars";
import { RowAction, RowActions } from "@components/ds/RowActions";
import { Stars } from "@components/ds/Stars";
import { editHref, ROUTES } from "@components/shared/config/constants";
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
 *  drift the first time one is edited.
 *
 *  **Below the fold the row is two columns, not one** (COS-326). Five of the six cells are
 *  `@max-3xl:hidden`, so what is left is the title cell and the action strip — and a strip that is out
 *  of the flow has nothing to sit in once the `added` column is gone. `1fr auto` gives it a track of
 *  its own: the title and its url take what is left and truncate into it. */
const INDEX_COLUMNS =
  "grid-cols-[--spacing(9)_--spacing(15.5)_1fr_--spacing(47)_--spacing(11)_--spacing(22)] gap-x-2 @max-3xl:grid-cols-[1fr_auto]";

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
  const title = bookmark.title;
  const url = bookmark.original_url ?? undefined;

  return (
    <div
      data-slot="index-row"
      role="row"
      className={cn(
        "group/row relative grid h-7.5 items-center border-b border-gr-border text-2xs transition-colors duration-120",
        INDEX_COLUMNS,
        "@max-3xl:h-auto @max-3xl:gap-x-2 @max-3xl:px-3 @max-3xl:py-2",
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

      {/* ⚠️ **Below the fold the title takes the rank and the url drops under it** (COS-311), which is
          the handoff's own folded card: the cell wraps, the title is given the whole line
          (`flex-basis: 100%`, `white-space: normal`), and what is left — the alarm glyph, then the
          url — falls onto the second. It shared one line with the url until this ticket, and the
          measurement is why it stops: at 420px the cell is 284px, of which the title had 136 and the
          url the rest, so an 80-character title ended after 30. It has all 284 now and wraps onto a
          second line instead — the same title measures two lines and no ellipsis. The row grows from
          43px to 49 when it fits on one, 65 when it does not.

          The rest of the handoff's card — `stars · date`, then `tags` — is deliberately **not**
          brought back. Its second rank reads `id · stars · date`, and `id` left this index with
          COS-299; the three ranks would also put a 43px row at better than double the height, on a
          page of 22. The owner's call, taken on the measurement. */}
      <div
        role="cell"
        className="flex min-w-0 items-center gap-2.5 @max-3xl:flex-wrap @max-3xl:gap-y-1"
      >
        {/* The link that covers the row. `truncate` on the anchor keeps a long title from pushing the
            url out of the cell — above the fold, where they share a 30px line. */}
        <Link
          href={`${ROUTES.bookmarksRecord.path}/${bookmark.id}`}
          className="min-w-0 truncate rounded-sm text-gr-fg-2 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-3 focus-visible:ring-gr-ring @max-3xl:basis-full @max-3xl:overflow-visible @max-3xl:whitespace-normal"
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
        {url && (
          <span
            data-slot="index-row-url"
            className="min-w-0 truncate text-3xs text-gr-fg-4 @max-3xl:flex-1"
          >
            {url.replace(/^https?:\/\//, "")}
          </span>
        )}
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

      {/* Out of the flow — `absolute` resolves against the row, which is the `relative` one. Beside
          the six cells rather than inside one, so the row keeps its ARIA structure; an absolutely
          positioned grid child takes no track. `z-1` puts it above the title link's overlay, which is
          why none of these handlers needs `stopPropagation`.

          ⚠️ **The two states are anchored to different things, and that is the point.** Hovering
          swaps the date for the actions *in place*, so the glyphs have to start where the date starts
          — `col-start-6 col-end-7` gives the strip the `added` column's grid area as its containing
          block, and `left-0` is then that column's left edge, no measured offset anywhere. Pinned to
          the row's right edge instead it landed 6px to the right of every date above and below it
          (measured), which is exactly the misalignment you see when a swap is not a swap. The three
          buttons are 70px in an 88px column, so they fit with room to spare. What is left is the
          22px button's own padding around a ~8px glyph — the ink starts ~7px in — and that stays: it
          is the control's box that aligns, not its ink, and closing the rest would take a negative
          margin.

          The confirm strip keeps `right-3`. Its label and two mini-buttons are twice the column, so
          there is no column to start from — anchored left it would run off the row's right edge.

          ⚠️ **Below the fold it comes back into the flow** (COS-326). Out of the flow it was painted
          on top of the url — measured at 420px, 86px of glyphs over the end of the line — because the
          folded row is no longer a 30px line with a spare `added` column to sit in, and nothing
          reserved the space. It takes the `auto` track of the folded grid instead: `relative` rather
          than `static`, because `z-index` does not apply to a static box and the title link's overlay
          would then swallow every click. `inset-auto` cancels the offsets, which a relative box would
          otherwise honour — `right-3` alone would shift it 12px left of where it belongs, and
          `col-start-auto` / `col-end-auto` put it back in the folded grid's `auto` track, which has
          no sixth column to be scoped to. */}
      <div
        className={cn(
          "absolute inset-y-0 z-1 flex items-center gap-2",
          "@max-3xl:relative @max-3xl:inset-auto @max-3xl:col-start-auto @max-3xl:col-end-auto",
          confirming ? "right-3" : "left-0 col-start-6 col-end-7",
        )}
      >
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
            {/* ⚠️ **A plain `<Link>`, and that is what opens the modal** (COS-319). The edit route is
                intercepted, so a client navigation from here lays the dialog over this index — with
                its filters, its page and its scroll position untouched, because they live in the
                query string and this row never unmounts. Anything that navigated another way — a
                `router.push` with a `window.location` fallback, an `<a>` — would leave the index and
                render the full-page form instead. */}
            <RowAction
              asChild
              title={INDEX_TEXT.row.edit}
            >
              <Link
                href={editHref(bookmark.id)}
                aria-label={INDEX_TEXT.row.edit}
              >
                ✎
              </Link>
            </RowAction>
            {/* ⚠️ **`✕` (U+2715), not the handoff's `⌧`.** U+2327 draws as an X inside a rectangle,
                and at this size that box is indistinguishable from the empty rectangle a browser
                paints for a glyph it cannot find — the one action of the three that reads as a
                rendering failure. Its neighbours are bare strokes; this one is too now. */}
            <RowAction
              danger
              title={INDEX_TEXT.row.remove}
              aria-label={INDEX_TEXT.row.remove}
              onClick={onAskRemove}
            >
              ✕
            </RowAction>
          </RowActions>
        )}
      </div>
    </div>
  );
}

export { INDEX_COLUMNS, IndexRow, MAX_CHIPS };
