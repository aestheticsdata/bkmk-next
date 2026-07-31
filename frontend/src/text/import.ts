/* The import screen's copy (COS-303). Same convention as `@text/create.ts`: the words live here, in
 * English, with no locale segment.
 *
 * **What this screen is.** The upload the application already had — one file field and a `send`
 * button — plus the documentation that sat above it. That documentation was a paragraph of French
 * and a `<pre>` holding a raw `sed -n 'l'` dump of a Session Buddy export; it is the same content
 * here, in the right pane, as two shape blocks and a sentence.
 *
 * **The staging table is real.** The file is parsed in the browser, mirroring the backend's own
 * parser, so `title`, `host`, the number of entries and the number of malformed lines are measured
 * from the file that was dropped. DATA 02 (COS-307) moves that parse to the server and the front's
 * copy leaves with it.
 *
 * ⚠️ **Three things the handoff draws have nothing behind them, and they are mocked** (the owner's
 * rule): the `NEW` / `DUP` state with the `new` / `duplicate` halves of the summary, the three
 * `on import` options, and the `last import` line. Each is marked at its use site and all three are
 * listed on **COS-307**, which is also the ticket that gives them real data. The values carrying a
 * hard-coded reading are grouped under `mock` so nothing can read as measured. */

export const IMPORT_TEXT = {
  command: {
    screen: "import",
    separator: "/",
    /** What the screen accepts, said once in the bar as the handoff does. */
    formats: "session buddy .txt · .csv",
    cancel: "cancel",
    send: "send ⌘↵",
    sending: "sending…",
  },

  sections: {
    file: "file",
    /** `staged · <filename>` — the caption carries the name of what was dropped. */
    staged: (filename: string) => `staged · ${filename}`,
    options: "on import",
    formats: "accepted formats",
    txtShape: "txt · shape",
    csvShape: "csv · shape",
  },

  drop: {
    prompt: "drop a .txt or .csv here",
    or: "or",
    choose: "choose file",
    /** ⚠️ **10, not the handoff's 5** — `multer({ limits: { fileSize: 10_000_000 } })` on
     *  `POST /bookmarks/upload` is the real ceiling, and a screen that says 5 would refuse a file the
     *  API accepts. COS-307 is where the two would be lowered together if 5 is what is wanted. */
    limits: "max 10 mb · utf-8",
    replace: "choose another",
    wrongType: ".txt or .csv only",
    tooLarge: "file is over 10 mb",
    unreadable: "could not read this file",
  },

  columns: {
    title: "title",
    host: "host",
    state: "state",
  },

  /** The summary under the table. `parsed` and `malformed` are counted from the file; the middle two
   *  are not — see `mock.duplicates`. */
  summary: (parsed: number, fresh: number, duplicates: number, malformed: number) =>
    `${parsed} entries parsed · ${fresh} new · ${duplicates} duplicate · ${malformed} malformed`,

  states: {
    /** A parsed line with no title or no link. Counted, not listed: the table shows what would be
     *  imported, and a malformed line is precisely what would not. */
    empty: "nothing staged yet",
    /** A link the browser cannot parse into a host. The backend still imports it, so it is not an
     *  error — there is simply nothing to put in that cell. */
    noHost: "—",
    /** The table draws a sample of a long file. Said out loud, so that a table stopping at two
     *  hundred rows cannot read as a file that had two hundred entries. */
    more: (rest: number) => `${rest} more not listed`,
    /** Reading the file, between the drop and the parse. Long enough to see on a large export. */
    reading: "reading the file…",
  },

  options: {
    skipDuplicates: "skip duplicates",
    captureShots: "capture shots",
    tagAsImported: "tag as imported",
    /** Said once beside the caption rather than three times on three disabled pills. */
    pending: "not wired yet",
  },

  formats: {
    /** The current screen's own paragraph, in English. The link is the one it already carried. */
    lead: "a .txt exported by the Chrome",
    extension: "Session Buddy",
    extensionHref: "https://chrome.google.com/webstore/detail/session-buddy/edacconmaakjimmfgnblocblbcdcpbko",
    tail: "extension, or a .csv with one",
    pair: "title;url",
    tailEnd: "pair per line.",
    /** The handoff's own sample, and the shape the backend's parser reads: a name line, then pairs of
     *  title and url separated by a blank line. */
    txt: "$\n  Framework reimagined — Qwik$\n  https://qwik.builder.io/$\n$",
    txtNote: "“$” marks the end of a line",
    csv: "Oral History of Bob Belleville;https://…\nWhat Makes A Good Cli Tool;https://…",
  },

  errors: {
    /** The upload failed. The API answers 500 with the offending url or title; neither is worth
     *  repeating to someone who dropped a file of a thousand lines. */
    submit: "could not import this file",
  },

  /* ─── Mocked readings — COS-307 ──────────────────────────────────────────────────────────
   * Hard-coded values that look measured and are not, together and named for what they are. */
  mock: {
    /** Every staged row's state. Nothing looks for duplicates — DATA 02 is the endpoint that does —
     *  so every entry reads as new, which is what an unrun check yields. `DUP` is drawn nowhere. */
    state: "new",
    /** The `duplicate` half of the summary, for the same reason. `parsed`, `new` and `malformed`
     *  around it are counted from the file; only this one is a constant. */
    duplicates: 0,
    /** The right pane's footer. Nothing records the history of past imports. */
    lastImport: "last import 2026-07-11 · 341 entries · 12 skipped",
  },

  aria: {
    file: "import file",
    table: "staged entries",
  },
} as const;
