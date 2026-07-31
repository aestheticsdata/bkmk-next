/* The shell's copy. Text lives here rather than inside the components, which is pfa's
 * convention (`~/dev/pfa/front/src/text/`).
 *
 * **In English, and with no locale segment.** pfa writes `text/fr/<module>.ts` because it
 * is a French app with an i18n layer; bkmk has neither — the GRAPHITE interface is in
 * English (§4 of the spec), so `@text/shell.ts` is the whole path. The ticket's
 * `src/text/fr/` was written before that was settled.
 *
 * ⚠️ **`build` and `uptime` are static chrome** (§8.1 of the spec, decided 2026-07-29).
 * They are rendered exactly as written and must never look alive: no `setInterval`
 * advancing the clock, no blinking LED. Only the tab counters and the account email are
 * real data. */

export const SHELL_TEXT = {
  wordmark: "BKMK",
  /** Static. An index build number, not a version read from anywhere. */
  build: "IDX/2.4.1",
  /** Static. See the warning above — this string never moves. */
  uptime: "uptime 04:12",
  about: "about",

  /** The four modules, keyed by the tab ids in `shell/config/constants.ts`. */
  tabs: {
    list: "index",
    create: "new",
    upload: "import",
    reminders: "alarms",
  },

  status: {
    /** The left-hand word, always in teal. */
    state: "ready",
    /** The default right-hand slot: the size of the index, then a static sync marker. */
    index: (total: string) => `idx ${total} · sync 12s`,
    /** The reminders screen's right-hand slot. */
    armed: (count: string) => `${count} armed`,
  },

  aria: {
    /** The chrome's tab row and the narrow-width tab bar are the same navigation, so they
     *  share one label. */
    modules: "modules",
    home: "back to the index",
    /** The account email is a link out of the session — see TopChrome for why. */
    signOut: "sign out",
  },
} as const;

/* The status bar's content, per screen. The handoff gives every screen its own keyboard
 * hints and its own right-hand slot; both are copy, so both live here.
 *
 * `right` is omitted where the value is computed (`list`, `reminders`) or where it belongs
 * to a screen that does not exist yet (`detail` wants `record <id>`, which UI 05 / COS-301
 * will supply once it owns that route). Omitting it falls back to `status.index`. */
export const SHELL_STATUS = {
  /** `⌥f filter` and not the handoff's `f filter` (COS-300): the button in the command bar prints
   *  `⌥F` and that is the combination the listener answers to. A hint naming a shortcut that does
   *  nothing is worse than no hint. */
  list: { hints: ["j/k move", "enter open", "⌥f filter", "n new"] },
  detail: { hints: ["esc back", "e edit", "a alarm", "x delete"] },
  /** The handoff writes `draft 2088`; the number is mock data, so only the word survives.
   *  UI 06 (COS-302) adds the real draft reference if the insert screen ever has one. */
  create: { hints: ["tab next", "⌘↵ commit", "esc cancel"], right: "draft" },
  upload: { hints: ["drop file", "⌘↵ send"], right: "import queue empty" },
  reminders: { hints: ["enter open", "s snooze", "d done"] },
  about: { hints: ["esc back"], right: "about" },
} as const;
