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
 * ✅ **The three controls work since COS-330, and they do not mean what the mockup's words suggest.**
 * `snooze` stops the alarm's clock and **keeps** the row — the list is the inventory of what is
 * armed, and something you have chosen to silence is still armed. `done` is the one that empties the
 * row out of the screen, by disarming the record, which is why it asks before doing it. `snooze all`
 * is the first of the two, over the whole account. `arm new` was never in that list: arming an alarm
 * means giving a reminder to a record, and the creation form is where that field lives. */

export const ALARMS_TEXT = {
  command: {
    screen: "alarms",
    separator: "/",
    /** The moment the countdowns are measured from. Real, and the only reason it is on screen: a
     *  column that says `T-01d` is meaningless without saying when. */
    clock: (now: string) => `clock ${now}`,
    snoozeAll: "snooze all",
    /** The same control once every alarm is asleep (COS-330). One button and not two: `snooze all` on
     *  a list that is already silent has nothing to do, and a disabled control beside an enabled one
     *  is a way of hiding which of them is live. */
    resumeAll: "resume all",
    /** The same control on a screen with no alarm at all. */
    noAlarms: "no alarm to snooze",
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
    /** The countdown cell of an alarm that is asleep (COS-330). A word rather than a number, because
     *  there is no next firing to count down to — and no gauge beside it, for that reason. */
    paused: "paused",
    /** Its `fires` cell. The dash is the fields table's own way of saying a row exists with no value
     *  in it. */
    noFire: "—",
    /** The day the record was filed. */
    added: (date: string) => `bkmk ${date}`,
    /** The day the alarm was armed, and how often it repeats from there. */
    armed: (date: string, frequency: number) => `alarm ${date} · ${frequency}d`,
    snooze: "snooze",
    /** The same control on a sleeping alarm: the pause is undone by pressing it again, and the
     *  countdown comes back on the number it froze on. */
    resume: "resume",
    done: "done",
    /** `done` disarms the record — the frequency and the arming date leave with the alarm — so it
     *  asks first, in place, the way a row asks before a delete on the index. */
    askDone: "done?",
    confirm: "confirm",
    cancel: "cancel",
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
