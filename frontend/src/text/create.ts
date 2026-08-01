/* The insert screen's copy (COS-302). Same convention as `@text/record.ts`: the words live here, in
 * English, with no locale segment.
 *
 * **What this screen is.** The create form the application already had — title, url, categories,
 * notes, stars, priority, reminder, screenshot — repainted in GRAPHITE. Two of its fields do not
 * survive the repaint: `group`, which the backend reads into an empty `if (group) {}` and writes
 * nowhere, and the file input's raw `<input type="file">` chrome, which the handoff draws as a slot.
 *
 * ⚠️ **Three things the handoff draws had nothing behind them, and they were mocked rather than
 * dropped** (the owner's call, and the difference from UI 09): `auto capture`, the duplicate count,
 * and the title fetched from the page's `<title>`. **The duplicate count is real since COS-308** and
 * has moved out of `mock` into `duplicates` below. The other two are still marked at their use site
 * and still listed on **COS-329**; whatever carries a hard-coded reading stays grouped under `mock`,
 * so that nothing can quietly read as measured.
 *
 * ⚠️ **The segments hold the real values, not the mockup's.** The handoff writes three priorities
 * (`high · med · low`) where the column has four, and four alarm offsets (`T-1d · T-3d · T-7d ·
 * date…`) where the alarm is a *frequency* in days with six settings. Same call `ds/PriorityBars`
 * already made: a control that cannot express a value users have already set is not a redesign of
 * that control, it is a smaller one. */

export const CREATE_TEXT = {
  /** The command bar: where you are, then the two ways out. */
  command: {
    screen: "insert",
    separator: "/",
    /** The handoff writes `record 2088 · draft`; the number is the id of a record that does not
     *  exist yet, so only the word survives — the same trimming `SHELL_STATUS.create` already did. */
    draft: "draft",
    cancel: "cancel",
    commit: "commit ⌘↵",
    committing: "committing…",
    /** Leaving a draft that has something in it, confirmed in place — the pattern the record's
     *  command bar already uses for `delete`. `esc` goes through the same door. */
    askDiscard: "discard?",
    discard: "discard",
    keep: "keep",
  },

  /** The captions, left column then right pane. */
  sections: {
    url: "url",
    title: "title",
    note: "note",
    tags: "tags",
    priority: "priority",
    stars: "stars",
    alarm: "alarm",
    shot: "shot",
    preview: "record preview",
  },

  fields: {
    urlPlaceholder: "https://…",
    /** ⚠️ **Not the handoff's `auto-fetched from <title>`.** Nothing fetches it (COS-329); a
     *  placeholder that names a feature the screen does not have is a promise, and this one would be
     *  made on every single insert. It says what the field is instead. */
    titlePlaceholder: "the record's name",
    notePlaceholder: "free text · urls become links",
    /** `priority` and `alarm` both offer "not set", and it is the default on a new record — the
     *  legacy form set neither, and picking one for the user is not a repaint. */
    unset: "—",
    alarmOff: "off",
    /** The alarm is a repeat interval, not a countdown. The record screen prints the same thing
     *  the long way round: `armed · every 5d`. */
    alarmHint: "every",
    alarmDays: (days: number) => `${days}d`,
    starsReadout: (stars: number, max: number) => `${stars}/${max}`,
    starsClear: "clear",
  },

  /** The token field. Wording deliberately parallel to `INDEX_TEXT.filters.categories`, which is the
   *  same control doing the filtering half of the job — with the one addition that makes it a
   *  different control: here a tag that does not exist yet can be written. */
  tags: {
    search: "search or create a tag",
    placeholder: "type to search, ↵ to add",
    mostUsed: "most used",
    matches: "matches",
    noMatch: "no tag matches",
    more: (rest: number) => `+${rest} more`,
    remove: (name: string) => `remove ${name}`,
    /** The dashed segment that creates one — the handoff's `+ add` chip, carrying what you typed. */
    create: (name: string) => `+ ${name}`,
    createAria: (name: string) => `create the tag ${name}`,
    /** `category.name` is `VARCHAR(20)` and a 21st character comes back as a raw SQL error, which is
     *  what `FIELD_LIMITS` exists to prevent. The field stops at 20; this says so once it is close. */
    limit: (max: number) => `max ${max}`,
  },

  shot: {
    /** ⚠️ **Mock — COS-329.** The handoff's caption for a capture pipeline that does not exist. */
    autoCapture: "auto capture",
    choose: "choose a file",
    replace: "replace",
    remove: "remove",
    /** The edit surface only (COS-319): the record already has a capture on the server. The handoff
     *  draws `captured` and `re-capture` as two segments; they are a **read-out and a control**, not
     *  a pair of toggles, so one is a caption in the slot and the other is the file button.
     *
     *  The image itself is not shown. Fetching it costs a second request for a base64 of the whole
     *  file — the record screen's own note — and this field is being edited, not consulted. */
    captured: "captured",
    recapture: "re-capture",
    /** What the slot says before a file is picked. See `mock.shotQueued`. */
    accept: "png or jpeg",
    tooLarge: "file is over 10 mb",
    wrongType: "png or jpeg only",
  },

  preview: {
    /** The mono readout, in the handoff's order. `id` is first and is always `—`: the identifier is
     *  assigned by the insert, so before the commit there is genuinely nothing to print. That is not
     *  a mock, it is the value. */
    id: "id",
    host: "host",
    tags: "tags",
    prio: "prio",
    stars: "stars",
    alarm: "alarm",
    shot: "shot",
    /** Every empty cell of the readout. One dash, so the block stays a column. */
    none: "—",
    /** `host` on a url that is not parseable yet — you are still typing it. */
    hostPending: "…",
    shotAttached: "attached",
  },

  errors: {
    title: "required",
    url: "not a url",
    /** The request failed. The API answers 400 with the offending fields and 500 with a message;
     *  neither is worth repeating to someone filling in a form. */
    submit: "could not save this record",
  },

  /* The duplicate warning under the readout (COS-308), which was `mock.duplicates` and the
   * mockup's own `2` until the index learned to answer the question. */
  duplicates: {
    /** The handoff's sentence, with the number it was drawn around now measured. Singular below two,
     *  because `1 duplicate candidates` is how a count reads when nobody looked at it. */
    found: (count: number) => `${count} duplicate candidate${count === 1 ? "" : "s"} in index`,
    review: "review before commit",
    /** Nothing matched, and saying so is the point: without it the block would be indistinguishable
     *  from one where the check has not run. */
    none: "no duplicate in index",
    /** More candidates than the pane is sent. There is no screen listing them all until the index
     *  can be searched by url (COS-335), so this is a count and not a link. */
    more: (count: number) => `+ ${count} more`,
    /** A record whose title is empty — possible, since the column has no default and the legacy
     *  form did not require one. The link needs something to be. */
    untitled: "untitled",
  },

  /* ─── Mocked readings — COS-329 ──────────────────────────────────────────────────────────
   * Hard-coded values that look measured and are not. They are here, together and named for
   * what they are, so that the de-mock ticket has one place to start from and so that nobody
   * reads one of them in a component and takes it for data. */
  mock: {
    /** The capture slot's state, and the size the handoff prints under it. Nothing captures and
     *  nothing measures: `bookmark.screenshot` holds a filename, and the only way an image gets
     *  there is the upload right beside this line. */
    shotQueued: "queued · 1280×800",
  },

  aria: {
    stars: (stars: number) => `${stars} out of 5`,
    /** The file input, which is visually the slot rather than a labelled control. */
    shot: "screenshot file",
  },
} as const;
