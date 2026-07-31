"use client";

import { Card } from "@components/ds/Card";
import { AlarmsCommandBar } from "@components/reminders/AlarmsCommandBar";
import { AlarmsLoad } from "@components/reminders/AlarmsLoad";
import { AlarmsTable } from "@components/reminders/AlarmsTable";
import { useAlarms } from "@src/services/useAlarms";

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

  return (
    <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-3 @max-3xl:gap-2">
      <Card className="flex min-h-0 flex-col">
        <AlarmsCommandBar />
        <AlarmsTable
          alarms={alarms}
          isLoading={isLoading}
          isError={isError}
        />
      </Card>

      <AlarmsLoad alarms={alarms} />
    </div>
  );
}

export { Alarms };
