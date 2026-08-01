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
 * and the title fetched from the page's `<title>`. **None of the three is a mock any more, and they
 * ended three different ways.** The duplicate count became real with COS-308 and moved into
 * `duplicates` below. The fetched title became real with COS-329 — it was never a mocked *reading*
 * but an absent function, and its placeholder went back to the handoff's own words with it. And
 * `auto capture` was **abandoned** (COS-394): the owner keeps taking screenshots by hand, so the
 * capture pipeline will not be built, and its two readings came off the screen rather than sit there
 * promising it for ever.
 *
 * ⚠️ **That last one is the rule's exit, not an exception to it.** "What does not exist yet gets
 * mocked, and a de-mock ticket takes it back" assumes the data eventually arrives. When it is decided
 * that it never will, the mark leaves with the feature — which is what makes the rule safe to apply
 * in the first place.
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
    /** ⚠️ **The handoff's own words, and they were refused until COS-329.** UI 06 wrote `the record's
     *  name` here instead, because a placeholder naming a feature the screen does not have is a
     *  promise made on every single insert. The fetch exists now — `usePageTitle`, on the url field's
     *  blur — so the sentence is true and it comes back. */
    titlePlaceholder: "auto-fetched from <title>",
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
    /** What the slot says before a file is picked, and it is the record screen's own word for the
     *  same absence (`RECORD_TEXT.states.noShot`) — the two screens describe one missing file the
     *  same way. It replaces the handoff's `queued · 1280×800`; see the header. */
    empty: "no screenshot",
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
    /** Beside the file button: what the picker and `jimpHelper` both accept. */
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

  /* The two readings beside the `title` caption while the page is being read (COS-329).
   *
   * They sit in `Field`'s `message` slot, which is the row that already exists beside the label — the
   * same slot the validation messages use, for the reason its header gives: a line under the control
   * would either reserve 22px on every field or move the card as the answer arrives.
   *
   * ⚠️ **`nothing` is drawn, where a silent failure would be cheaper.** Most of the hosts that give
   * no title are the ones that refuse robots — `stackoverflow.com` and `etsy.com` both answer 403 —
   * and someone who has just watched a field not fill itself in is owed the difference between "this
   * site would not say" and "the feature is broken". It is a statement about the host, so it is in the
   * quiet ink and not the danger one: nothing has gone wrong and there is nothing to fix. */
  autoTitle: {
    reading: "reading…",
    nothing: "no title found",
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

  /* ⚠️ **The `mock` block was here and it is gone with the last value in it** (COS-394). It held
   * `queued · 1280×800`, the capture slot's invented state, kept apart from the real copy so that
   * nobody could read it in a component and take it for data. That grouping did its job: when the
   * automatic capture was abandoned, there was exactly one place to look for what had to go with it. */

  aria: {
    stars: (stars: number) => `${stars} out of 5`,
    /** The file input, which is visually the slot rather than a labelled control. */
    shot: "screenshot file",
  },
} as const;
