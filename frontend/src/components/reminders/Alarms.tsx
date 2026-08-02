"use client";

import { Card } from "@components/ds/Card";
import { AlarmsCommandBar } from "@components/reminders/AlarmsCommandBar";
import { AlarmsLoad } from "@components/reminders/AlarmsLoad";
import { AlarmsTable } from "@components/reminders/AlarmsTable";
import { useAlarms } from "@src/services/useAlarms";
import { useEffect, useState } from "react";

/** How long the row we were sent to stays lit. Long enough to catch the eye on a list that scrolled
 *  under it, short enough to be gone before the row has been read. */
const FLASH_MS = 1200;

/* `Reminders_Graphite` — the alarms screen (COS-304).
 *
 * **What the screen was**: a two-column grid of record cards, each one mounting the whole legacy
 * detail component, or the sentence "Pas d'alarmes aujourd'hui". It listed what rang *that day*,
 * because that is all `GET /reminders` returned.
 *
 * ⚠️ **It now lists every armed alarm, and that was a decision, not a side effect.** The handoff's
 * table has a `countdown` column and a fourteen-day load chart under it; neither can exist on a list
 * where every row rings in zero days. So the controller stopped filtering and started computing —
 * `alarm_days_until`, `alarm_next_fire` — and the ringing-today list is still in there, at
 * `alarm_days_until === 0`. The chrome's `alarms NNN` and the status bar's `N armed` moved with it,
 * onto what those two words actually mean.
 *
 * **Nothing on this screen is a mocked reading.** Countdown, fire date, the load chart and the clock
 * are all measured or computed. What *is* drawn and inert is three controls — `snooze`, `done`,
 * `snooze all` — because no route pushes an alarm back or acknowledges one. COS-330 wires them.
 *
 * Two cards, the table filling the desk and the chart pinned under it. The handoff's rows are `auto
 * 1fr`, which gives the fortnight chart every spare pixel and squeezes the alarms into the top of
 * the screen; it is the wrong way round for a table that can hold every alarm in the account. */
function Alarms() {
  const { alarms, isLoading, isError } = useAlarms();
  /* What is actually going to ring (COS-330). Both consumers below want this rather than the length
     of the list: a sleeping alarm is on the screen without being counted anywhere as armed. */
  const running = alarms.filter((alarm) => alarm.alarm_paused_at === null).length;
  const [flashing, setFlashing] = useState<string>();

  /* Landing on a row (COS-330). The address carries `#alarm-<id>` and the browser cannot follow it:
     the list arrives from react-query, so at first paint no element has that id and the native
     fragment scroll finds nothing to aim at. This runs once the rows are in.

     ⚠️ **The scroll is repeated while the desk is still settling, and that is a fix.** Measured: a
     single call lands 190px short on a 37-row list, leaving the row it aimed at off screen. The
     chart under the table is a **second** request (`useAlarmLoad`), so it mounts after this, and the
     `1fr auto` grid gives the scroller a smaller height than the one the position was computed
     against. Anything that resizes the scroller does the same — the fold, a font landing late — so
     the answer is to watch the box rather than to guess a delay: re-aim on every resize, and stop
     when the flash does.

     ⚠️ **The dependency is `alarms.length`, not `alarms`.** The array is a new reference on every
     refetch, and re-lighting the row each time an alarm is snoozed elsewhere on the screen would be
     a light going on for no reason. */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash || alarms.length === 0) return;

    const row = document.getElementById(hash);
    if (!row) return;

    const aim = () => row.scrollIntoView({ block: "center" });
    aim();
    setFlashing(hash);

    const scroller = row.parentElement;
    const observer = scroller ? new ResizeObserver(aim) : undefined;
    if (scroller && observer) observer.observe(scroller);

    const settle = setTimeout(() => {
      observer?.disconnect();
      setFlashing(undefined);
    }, FLASH_MS);

    return () => {
      observer?.disconnect();
      clearTimeout(settle);
    };
  }, [alarms.length]);

  return (
    <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-3 @max-3xl:gap-2">
      <Card className="flex min-h-0 flex-col">
        <AlarmsCommandBar
          running={running}
          total={alarms.length}
        />
        <AlarmsTable
          alarms={alarms}
          isLoading={isLoading}
          isError={isError}
          flashing={flashing}
        />
      </Card>

      {/* Since COS-310 the chart asks the server for its fourteen rows rather than counting the list
          above it. What it still takes from here is **whether anything is armed at all** — flat bars
          mean either that or a fortnight with no firing in it, and only the second gets a message.

          ⚠️ **It is told how many alarms *run*, not how many are listed** (COS-330). A screen where
          everything has been snoozed is the first case: fourteen flat bars under a caption about a
          quiet fortnight would blame the calendar for a decision the user made. */}
      <AlarmsLoad armed={running} />
    </div>
  );
}

export { Alarms };
