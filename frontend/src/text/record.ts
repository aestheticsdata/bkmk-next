/* The record screen's copy (COS-301). Same convention as `@text/index.ts`: the words live here, in
 * English, with no locale segment.
 *
 * **The screen is read-only**, which is the handoff's call (§9): editing is a modal (COS-319), not a
 * second screen that repeats this one with inputs in it.
 *
 * ⚠️ **Three of the handoff's blocks are not written here**, and the ticket asks for all three to be
 * left out: `hash` in the fields table, and `log` and `related · same tags` in the right pane. None
 * of the three exists in the database, and this lot runs no MySQL migration — DATA 04 (COS-309)
 * brings them back with the columns behind them. They are simply not rendered: no placeholder, no
 * permanent skeleton, nothing that reads as a value that failed to load.
 *
 * ⚠️ **No `alarm` button either**, though the handoff's command bar draws one. It is the one control
 * of the four with nothing to do: arming a reminder means writing `reminder` on the record, which is
 * the edit form's field, and the legacy screen this replaces had `back / edit / delete` and no alarm
 * control at all. The value is on the screen — `fields.alarm` — and `edit` is how it changes. */

export const RECORD_TEXT = {
  /** The command bar's breadcrumb: the way back, then which record this is. */
  index: "‹ index",
  separator: "/",
  record: (id: number | string) => `record ${id}`,

  actions: {
    edit: "edit",
    /** The primary action of the screen: the record exists to be opened. */
    open: "open url ↗",
    /** Same slot on a record with no url, so the bar keeps its shape. */
    noUrl: "no url on this record",
    remove: "delete",
    askRemove: "delete?",
    confirm: "confirm",
    cancel: "cancel",
  },

  /** The two captions of the left column, and the two of the right pane. */
  sections: {
    title: "title",
    fields: "fields",
    note: "note",
    preview: "preview",
  },

  fields: {
    url: "url",
    added: "added",
    priority: "priority",
    stars: "stars",
    tags: "tags",
    alarm: "alarm",
    shot: "shot",
  },

  values: {
    /** The one "nothing here" of the fields table — a dash rather than an empty cell, so a row that
     *  has no value still reads as a row. */
    none: "none",
    /** `priority` is `NULL` on a record where nobody picked a level. */
    noPriority: "—",
    /** `alarm`: the frequency is a number of days, counted from the day it was armed. The handoff's
     *  `armed · T-07d` is a countdown to a date the schema does not hold; this is what it does. */
    armed: (days: number) => `armed · every ${days}d`,
    armedSince: (date: string) => `since ${date}`,
    /** `shot`: the file is there, its dimensions are not — the column stores a filename. The
     *  handoff's `captured 1280×800` prints a size nothing measures. */
    captured: "captured",
    /** The note, on a record that has none. `— empty —` is the handoff's own. */
    emptyNote: "— empty —",
  },

  states: {
    loading: "loading the record",
    error: "could not load this record",
    /** A valid id for a record that is not there — deleted, or someone else's. */
    missing: "no such record",

    /* The preview's three empty states, which are three different things: no screenshot was ever
     * taken, one is on its way, and the file the record names could not be read. The last is worth
     * its own words — screenshots are captured out of band, and a record can point at a file that
     * never landed. */
    noShot: "no screenshot",
    shotLoading: "loading the screenshot",
    shotError: "screenshot unavailable",
  },

  aria: {
    /** The preview is a screenshot of the page the record points at. */
    shot: (title: string) => `screenshot of ${title}`,
  },
} as const;
