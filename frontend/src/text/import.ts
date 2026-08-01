/* The import screen's copy (COS-303, de-mocked by COS-307). Same convention as `@text/create.ts`:
 * the words live here, in English, with no locale segment.
 *
 * **What this screen is.** The upload the application already had — one file field and a `send`
 * button — plus the documentation that sat above it. That documentation was a paragraph of French
 * and a `<pre>` holding a raw `sed -n 'l'` dump of a Session Buddy export; it is the same content
 * here, in the right pane, as two shape blocks and a sentence.
 *
 * ⚠️ **The `mock` block is gone, and with it three of the four things this screen was inventing.**
 * The state of each entry and the `new` / `duplicate` halves of the summary are the API's answer, the
 * two live options travel with the commit, and `last import` is read from `import_run`. What is left
 * disabled is `capture shots`, because nothing in the application captures a screenshot from a url —
 * that one is COS-329, and it is said in one line beside the caption rather than promised here. */

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

  /** The summary under the table. All four numbers come from the parse endpoint and cover the whole
   *  file, not the sample of it the table draws. */
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
    /** Between the drop and the parse — a round trip now, and the file still has to be uploaded, so
     *  it lasts longer than it did when the browser read it. */
    reading: "reading the file…",
    /** The `state` column, lowercase because the cell wears `uppercase`. The API answers `NEW` /
     *  `DUP`; what it compares to decide is documented on `markImportDuplicates`. */
    new: "new",
    duplicate: "dup",
  },

  options: {
    skipDuplicates: "skip duplicates",
    captureShots: "capture shots",
    tagAsImported: "tag as imported",
    /** The one switch still drawn and disabled — no route accepts it, because nothing captures a
     *  screenshot from a url. Said once beside the caption, as it was when all three were inert. */
    pending: "capture not wired yet",
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

  /** The right pane's footer, read from `import_run` (COS-307). `entries` is what the run wrote and
   *  `skipped` what it passed over, so the two together say what became of that file. */
  lastImport: {
    line: (date: string, entries: number, skipped: number) =>
      `last import ${date} · ${entries} entries · ${skipped} skipped`,
    /** An account that has never imported. Not `0 entries · 0 skipped` under today's date, which
     *  would be a reading of something that never happened. */
    none: "no import yet",
  },

  errors: {
    /** The upload failed. The API answers 500 with the offending url or title; neither is worth
     *  repeating to someone who dropped a file of a thousand lines. */
    submit: "could not import this file",
    /** The parse failed — the round trip, not the file's shape: a file the parser cannot read comes
     *  back as zero entries and a count of malformed lines, which is an answer and not an error. */
    parse: "could not read this file",
  },

  aria: {
    file: "import file",
    table: "staged entries",
  },
} as const;
