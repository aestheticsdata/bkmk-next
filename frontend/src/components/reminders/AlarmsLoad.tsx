"use client";

import { Card } from "@components/ds/Card";
import { Overline } from "@components/ds/Overline";
import { alarmLoad, alarmsToday } from "@components/reminders/helpers/alarmLoad";
import { cn } from "@lib/utils";
import { ALARMS_TEXT } from "@text/alarms";
import { format } from "date-fns";

import type { LoadDay } from "@components/reminders/helpers/alarmLoad";
import type { Reminder } from "@src/schemas/reminders";

/** The handoff's empty bar: 14% of the height, so a quiet day is still a mark on the axis rather
 *  than a gap in it. The busiest day takes the remaining 86%. */
const FLOOR = 14;

/** `jan 19`, the handoff's own legend. Lowercased because every label in GRAPHITE is. */
const legend = (date: Date) => format(date, "MMM dd").toLowerCase();

/* `next 14 days · load` (COS-304) — how the fortnight ahead is distributed.
 *
 * ⚠️ **The bars are counted, not drawn from a list of lucky days.** The handoff hard-codes
 * `[1, 3, 5, 7]`; `alarmLoad` counts the same alarms the table above is listing, and it can, because
 * the screen holds all of them. DATA 05 (COS-310) moves the aggregate to the server — which is where
 * it has to be the moment this list is paginated — and nothing on screen changes when it does.
 *
 * **The height is relative to the busiest day**, so a full bar means "the most alarms any day in the
 * window has" and not "some alarms". With one alarm a day the chart is flat and full, which is the
 * truth about that fortnight.
 *
 * The card is only rendered when something is armed: with no alarm there is no day to date the axis
 * from, and fourteen empty bars under a caption promising a load would be an invented reading. */
function AlarmsLoad({ alarms }: { alarms: Reminder[] }) {
  const today = alarmsToday(alarms);
  if (!today) return null;

  const days = alarmLoad(alarms, today);
  const busiest = Math.max(...days.map((day) => day.count));

  return (
    <Card className="flex shrink-0 flex-col px-5 py-4 @max-3xl:px-3.5 @max-3xl:py-3">
      <Overline className="mb-2.5">{ALARMS_TEXT.load.caption}</Overline>

      {/* 112px, and the height is the one thing here that had to be measured rather than read off
          the handoff. Its chart takes `1fr` of the desk and stands about 300px tall, which on a card
          pinned under a scrolling table would leave the alarms a third of the screen. Below 112 the
          bars are wider than they are tall — at 1440 there are fourteen of them across 1320px — and
          a bar wider than it is tall stops reading as a bar. */}
      <div
        aria-label={ALARMS_TEXT.aria.load}
        className="flex h-28 items-end gap-1 @max-3xl:h-16"
      >
        {days.map((day) => (
          <Bar
            key={day.date.toISOString()}
            day={day}
            busiest={busiest}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <Overline>{legend(days[0].date)}</Overline>
        {busiest === 0 && <Overline className="text-gr-fg-4">{ALARMS_TEXT.load.empty}</Overline>}
        <Overline>{legend(days[days.length - 1].date)}</Overline>
      </div>
    </Card>
  );
}

/** One day. `title` rather than a tooltip component: the bar carries a date and a count, which is
 *  two words the browser can show for free, and a chart of fourteen boxes does not warrant a popper.
 *
 *  The height is the one inline style on the screen, and it has to be: it is a computed percentage,
 *  which is what Tailwind cannot express as a class. */
function Bar({ day, busiest }: { day: LoadDay; busiest: number }) {
  const height = day.count === 0 ? FLOOR : FLOOR + (day.count / busiest) * (100 - FLOOR);

  return (
    <div
      title={ALARMS_TEXT.load.day(format(day.date, "yyyy-MM-dd"), day.count)}
      style={{ height: `${height}%` }}
      className={cn(
        // Radius 5 → `rounded-md` (6), the step the chip and the tab were snapped to by DS 01.
        "flex-1 rounded-md",
        // The teal glow of the primary action, which is the handoff's own shadow on these bars
        // rounded to the token that already carries it.
        day.count > 0 ? "bg-gr-accent shadow-gr-primary" : "bg-gr-border",
      )}
    />
  );
}

export { AlarmsLoad };
