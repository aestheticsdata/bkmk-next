/* The alarms screen's copy (COS-304). Same convention as `@text/create.ts` and `@text/import.ts`:
 * the words live here, in English, with no locale segment.
 *
 * **What this screen is.** The reminders page the application already had — a grid of record cards,
 * or "Pas d'alarmes aujourd'hui" — rebuilt as the handoff's table, and widened from *what rings
 * today* to *every armed alarm*. The owner's call, and the reason is in the columns: `countdown` and
 * the fourteen-day chart cannot be drawn from a list where every row rings in zero days. `GET
 * /reminders` returns the whole inventory now; the ringing-today list is `alarm_days_until === 0`.
 *
 * **Nothing here is a mocked reading.** Every value on the screen is measured or computed: the
 * countdown and the fire date come from the alarm's own frequency, the load chart is counted from
 * the same rows, and the clock is the browser's. That is a change of situation rather than of rule —
 * the data happened to be there once the endpoint stopped filtering it away.
 *
 * ⚠️ **What *is* drawn and inert: `snooze`, `done`, `snooze all`.** No route pushes an alarm back or
 * acknowledges one, so all three are disabled, and `pending` says so once rather than three times.
 * The account menu's three unbuilt entries set that precedent (COS-321): shown, so you learn what
 * the screen will do, and greyed, because the one thing worse than a missing control is one that
 * does nothing when pressed. **COS-330** is the ticket that wires them. */

export const ALARMS_TEXT = {
  command: {
    screen: "alarms",
    separator: "/",
    /** The moment the countdowns are measured from. Real, and the only reason it is on screen: a
     *  column that says `T-01d` is meaningless without saying when. */
    clock: (now: string) => `clock ${now}`,
    snoozeAll: "snooze all",
    armNew: "arm new",
  },

  columns: {
    title: "title",
    countdown: "countdown",
    fires: "fires",
    added: "added / armed",
    act: "act",
  },

  row: {
    /** `T-07d`, the handoff's own format. `T-00d` is an alarm ringing today, which is what the
     *  endpoint used to return and nothing else. */
    countdown: (days: number) => `T-${String(days).padStart(2, "0")}d`,
    /** The day the record was filed. */
    added: (date: string) => `bkmk ${date}`,
    /** The day the alarm was armed, and how often it repeats from there. */
    armed: (date: string, frequency: number) => `alarm ${date} · ${frequency}d`,
    snooze: "snooze",
    done: "done",
    /** Said once on the pair of controls, not once per button. */
    pending: "not wired yet",
  },

  load: {
    caption: "next 14 days · load",
    /** One bar's tooltip. Counted from the same alarms the table lists. */
    day: (date: string, count: number) => `${date} · ${count === 1 ? "1 alarm" : `${count} alarms`}`,
    empty: "no alarm in the next 14 days",
  },

  states: {
    loading: "loading alarms…",
    error: "could not load alarms",
    /** No alarm armed at all — not "none today", which is what this screen used to be able to say. */
    empty: "no alarm armed",
    /** A reminder whose record has no url. The row is still a record, so it still opens. */
    noUrl: "no url",
  },

  aria: {
    table: "armed alarms",
    /** The chart is a reading of the table above it, so it is labelled as one rather than left as an
     *  unnamed row of coloured boxes. */
    load: "alarms per day over the next 14 days",
  },
} as const;
