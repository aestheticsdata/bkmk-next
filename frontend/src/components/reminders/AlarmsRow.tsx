"use client";

import { MiniButton } from "@components/ds/MiniButton";
import { ROUTES } from "@components/shared/config/constants";
import { Progress } from "@components/ui/progress";
import { cn } from "@lib/utils";
import { ALARMS_TEXT } from "@text/alarms";
import { format } from "date-fns";
import Link from "next/link";

import type { Reminder } from "@src/schemas/reminders";

/** The columns, in 4px steps: `title 1fr · countdown 108 · fires 76 · added/armed 140 · act 136`,
 *  with the index's 8px gutter between them.
 *
 *  ⚠️ **Every departure from the handoff's `58 1fr 132 118 150 96` was measured**, in Chrome at
 *  1440×900 against the real IBM Plex Mono, not estimated from the mockup.
 *
 *  Its leading 58px is `id`, which the owner took out of the index for reasons that hold here word
 *  for word — a database key among titles and dates, unsortable — and a table carrying it on one
 *  screen and not the other is the inconsistency, not the removal.
 *
 *  The four that remain are sized to their content plus a few pixels: `T-07d` and its 56px meter
 *  measure 97 (→ 108), a date at `text-2xs` measures 66 (→ 76), `alarm 2023-09-02 · 30d` measures
 *  132 (→ 140), and the `SNOOZE` / `DONE` pair measures 114, which with `pr-4` needs 130 (→ 136).
 *  The handoff's own numbers were right for a `fires` column holding **a date and a time** — an
 *  alarm has no hour anywhere in the schema, so `09:00` is a precision nothing can produce — and for
 *  an `act` column holding a run of grey text rather than two buttons. Its 96 clipped them by 34.
 *
 *  460 of fixed track against the handoff's 496, so the title cell measures 920 where the handoff's
 *  numbers gave it 882, and no column is padded with blank space.
 *
 *  Exported because the header row must use the identical string: two grids that agree by accident
 *  drift the first time one is edited.
 *
 *  **Below the fold it is three columns**, which is the ticket's own instruction: title, then
 *  `countdown` and `fires`, with `added / armed` and `act` gone. */
const ALARM_COLUMNS =
  "grid-cols-[1fr_--spacing(27)_--spacing(19)_--spacing(35)_--spacing(34)] gap-x-2 @max-3xl:grid-cols-[1fr_auto_auto]";

/** Oxide at one day or less — the ticket's rule, and the token's own definition: `--gr-accent-2` is
 *  documented as "stars, imminent alarm". `0` is today. */
const IMMINENT_DAYS = 1;

/* One row of the alarms table (COS-304). 44px, the handoff's own height: it holds two lines in the
 * title cell and two more in `added / armed`, so it cannot be the index's 30.
 *
 * **The whole row opens the record**, with the index's arrangement and for the same reason: the
 * title is a real `<Link>` whose `::after` covers the row, so the click target is the row and the
 * thing being clicked is still an anchor — Enter opens it, ⌘-click opens a tab, the status bar shows
 * where it goes. That is what makes the status bar's `enter open` true here without a listener.
 *
 * ⚠️ **The gauge is the alarm's own cycle, not the handoff's `100 - days * 12`.** That formula is a
 * slope with no source: it empties in a little over eight days whatever the alarm does. What the bar
 * can honestly show is how far through the current period the alarm is — `(frequency - days) /
 * frequency` — so a weekly alarm and a monthly one both fill as they approach and both read full on
 * the day they ring.
 *
 * ⚠️ **`snooze` and `done` are drawn and disabled — COS-330.** No route pushes an alarm back or
 * acknowledges one. The `title` sits on the wrapper rather than on the buttons because a disabled
 * button receives no pointer events and would never show it. */
function AlarmsRow({ alarm }: { alarm: Reminder }) {
  const title = decodeURIComponent(alarm.title);
  const url = alarm.original_url ?? undefined;
  const days = alarm.alarm_days_until;
  const imminent = days <= IMMINENT_DAYS;
  const elapsed = ((alarm.alarm_frequency - days) / alarm.alarm_frequency) * 100;

  return (
    <div
      role="row"
      className={cn(
        "relative grid h-11 items-center border-b border-gr-border text-2xs transition-colors duration-120 hover:bg-white/20",
        ALARM_COLUMNS,
        "@max-3xl:h-auto @max-3xl:px-3 @max-3xl:py-2",
      )}
    >
      {/* `pl-4` rides the first column — it is the card's left margin, not the title's. */}
      <div
        role="cell"
        className="grid min-w-0 pl-4 @max-3xl:pl-0"
      >
        <Link
          href={`${ROUTES.bookmarksRecord.path}/${alarm.id}`}
          className="min-w-0 truncate rounded-sm text-gr-fg-2 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-3 focus-visible:ring-gr-ring"
        >
          {title}
        </Link>
        {/* Under the title rather than beside it, as the handoff has it: the row is tall enough for
            two lines here and the index's single line is not. */}
        <span className="min-w-0 truncate text-3xs text-gr-fg-4">
          {url ? url.replace(/^https?:\/\//, "") : ALARMS_TEXT.states.noUrl}
        </span>
      </div>

      <div
        role="cell"
        className="flex items-center gap-2"
      >
        <span className={cn("num shrink-0", imminent ? "text-gr-accent-2" : "text-gr-fg-2")}>
          {ALARMS_TEXT.row.countdown(days)}
        </span>
        {/* 56px, the handoff's width. Gone below the fold, where the number carries the column on its
            own and 56px of bar is the difference between the title fitting and not. */}
        <Progress
          value={elapsed}
          aria-label={ALARMS_TEXT.columns.countdown}
          className={cn("w-14 @max-3xl:hidden", imminent && "[&_[data-slot=progress-indicator]]:bg-gr-accent-2")}
        />
      </div>

      <div
        role="cell"
        className="num text-2xs text-gr-fg-3"
      >
        {format(alarm.alarm_next_fire, "yyyy-MM-dd")}
      </div>

      <div
        role="cell"
        className="text-3xs leading-relaxed text-gr-fg-3 @max-3xl:hidden"
      >
        <div className="truncate">
          {ALARMS_TEXT.row.added(alarm.date_added ? format(alarm.date_added, "yyyy-MM-dd") : "—")}
        </div>
        <div className="truncate">
          {ALARMS_TEXT.row.armed(format(alarm.alarm_added, "yyyy-MM-dd"), alarm.alarm_frequency)}
        </div>
      </div>

      {/* `z-1` puts the pair above the title link's overlay, which is what lets the wrapper's tooltip
          appear at all. */}
      <div
        role="cell"
        className="flex justify-end gap-2 pr-4 @max-3xl:hidden"
      >
        <span
          title={ALARMS_TEXT.row.pending}
          className="relative z-1 flex gap-2"
        >
          <MiniButton disabled>{ALARMS_TEXT.row.snooze}</MiniButton>
          <MiniButton disabled>{ALARMS_TEXT.row.done}</MiniButton>
        </span>
      </div>
    </div>
  );
}

export { ALARM_COLUMNS, AlarmsRow };
