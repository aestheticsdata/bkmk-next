/* The shell's copy. Text lives here rather than inside the components, which is pfa's
 * convention (`~/dev/pfa/front/src/text/`).
 *
 * **In English, and with no locale segment.** pfa writes `text/fr/<module>.ts` because it
 * is a French app with an i18n layer; bkmk has neither — the GRAPHITE interface is in
 * English (§4 of the spec), so `@text/shell.ts` is the whole path. The ticket's
 * `src/text/fr/` was written before that was settled.
 *
 * ⚠️ **The chrome's two invented readings are gone** (COS-321, the owner's call): `IDX/2.4.1`
 * beside the wordmark, a build number nothing in the project produces, and `uptime 04:12`, a
 * clock that never advanced. §8.1 of the spec says static values are rendered exactly as written
 * — never a `setInterval`, never a blinking LED — not that every slot the mockup fills has to be
 * filled. The auth screens' `build 2.4.1 · tls on` went the same way in the same pass; see
 * `build` in `@text/auth.ts`.
 *
 * What is left of it is `sync 12s`, inside `status.index`. The tab counters and the account
 * email are the shell's only real values. */

export const SHELL_TEXT = {
  wordmark: "BKMK",
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
    /** The reminders screen's right-hand slot: how many alarms are actually going to ring. */
    armed: (count: string) => `${count} armed`,
    /** The same slot once something is asleep (COS-330). ⚠️ **`armed` on its own would be a false
     *  reading**: a paused alarm sits in the list, and the tab above counts it under `alarms NNN`
     *  because the list is the screen's inventory — but it is not armed, and this is the word that
     *  says so. The second half appears only when there is something for it to say. */
    armedWithPaused: (armed: string, paused: string) => `${armed} armed · ${paused} paused`,
    /** The record screen's (COS-301). Which record is open, read off the address bar by
     *  `useShellRoute` — the one screen whose right-hand slot is neither a counter nor a constant. */
    record: (id: string) => `record ${id}`,
  },

  /* The account menu (COS-321, wired further by COS-404). `change password` and
   * `set/change recovery passphrase` now open real dialogs; `language` is still drawn and
   * **disabled** — it needs a translation layer bkmk has none of, out of scope for COS-404. It
   * stays shown rather than hidden for the same reason it always was: the menu is also how you
   * learn what an account has. `log out` remains the entry that works unconditionally. */
  menu: {
    caption: "signed in",
    password: "change password",
    /** Shown when the account has no recovery passphrase yet. */
    passphrase: "set recovery passphrase",
    /** Shown once it does (COS-404) — the label is the only thing that tells the two states
     *  apart, there is no third. */
    passphraseChange: "change recovery passphrase",
    language: "language",
    /** The only locale there is. No submenu while the row is disabled — see `UserMenu`. */
    languageValue: "english",
    signOut: "log out",
  },

  aria: {
    /** The chrome's tab row and the narrow-width tab bar are the same navigation, so they
     *  share one label. */
    modules: "modules",
    home: "back to the index",
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
  /** ⚠️ **No hint** (COS-301), for the reason About has none: the handoff's `esc back · e edit ·
   *  a alarm · x delete` names four keys nothing listens for, and the screen has a command bar with
   *  the same actions on it. FIN 02 (COS-312) binds them and writes them back — minus `a`, which
   *  belongs to a control this screen does not have. Its right-hand slot is `record <id>`, which is
   *  computed rather than written here. */
  detail: { hints: [] },
  /** The handoff writes `draft 2088`; the number is mock data, so only the word survives.
   *  UI 06 (COS-302) adds the real draft reference if the insert screen ever has one. */
  create: { hints: ["tab next", "⌘↵ commit", "esc cancel"], right: "draft" },
  upload: { hints: ["drop file", "⌘↵ send"], right: "import queue empty" },
  /** ⚠️ **`s snooze` and `d done` are gone** (COS-304), for the reason the record screen has no
   *  hints at all: they named two keys nothing listens for — and now name two *controls* that are
   *  drawn and disabled, so binding them would be worse than leaving them unbound. They come back
   *  with COS-330, which builds the routes, not with the shortcut lot: COS-312's table does not have
   *  them. `enter open` stays and is true — every row is a link to its record. */
  reminders: { hints: ["enter open"] },
  /** No hint: the handoff's `esc back` was written for a screen with a key bound to it, and About
   *  has a link and no listener (COS-305). The shortcut lot (COS-312) is what makes it true. */
  about: { hints: [], right: "about" },
} as const;
