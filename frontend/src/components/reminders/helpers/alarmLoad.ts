import { addDays, subDays } from "date-fns";

import type { Reminder } from "@src/schemas/reminders";

/** Fourteen, from the handoff's `next 14 days · load` and its fourteen bars. */
const LOAD_DAYS = 14;

type LoadDay = { date: Date; count: number };

/** The day the server measured every countdown against.
 *
 *  Derived from the data rather than read off the browser's clock, and that is the point: a row
 *  fires on `alarm_next_fire`, which is `alarm_days_until` days from the server's `CURDATE()`, so
 *  subtracting one from the other recovers that date exactly. A client an hour past midnight in
 *  another zone would otherwise label the first bar with a day the countdowns do not agree with.
 *
 *  `undefined` when there is no alarm at all — there is nothing to date, and nothing to chart. */
function alarmsToday(alarms: Reminder[]): Date | undefined {
  const first = alarms[0];
  return first ? subDays(first.alarm_next_fire, first.alarm_days_until) : undefined;
}

/* The fourteen-day load, counted from the alarms the table is already showing (COS-304).
 *
 * ⚠️ **This is a real aggregate, not the handoff's `[1, 3, 5, 7]`** — and it can be, because the
 * screen holds the complete set: `GET /reminders` returns every armed alarm, unpaginated, so
 * counting them here gives the same answer a `GROUP BY` would. DATA 05 (COS-310) moves it to the
 * server, where it belongs once the list is paginated or the number of alarms stops being small.
 *
 * An alarm is a **repeat**, so it can land in the window more than once: one that rings in two days
 * every three days rings on days 2, 5, 8, 11 of the chart. Stepping by `alarm_frequency` from
 * `alarm_days_until` is the whole rule, and it is why a daily alarm fills all fourteen bars rather
 * than the first.
 *
 * Alarms further out than the window contribute nothing: their first offset is already past the end
 * and the loop never runs. */
function alarmLoad(alarms: Reminder[], today: Date): LoadDay[] {
  const days: LoadDay[] = Array.from({ length: LOAD_DAYS }, (_, offset) => ({
    date: addDays(today, offset),
    count: 0,
  }));

  for (const alarm of alarms) {
    // Both guaranteed by the query — `frequency > 0`, and a `MOD` of positives is never negative —
    // but a zero step here would be an infinite loop rather than a wrong chart.
    if (alarm.alarm_frequency < 1 || alarm.alarm_days_until < 0) continue;

    for (let offset = alarm.alarm_days_until; offset < LOAD_DAYS; offset += alarm.alarm_frequency) {
      days[offset].count += 1;
    }
  }

  return days;
}

export { alarmLoad, alarmsToday, LOAD_DAYS };
export type { LoadDay };
