/* The copy of the two auth screens (COS-297). Same convention as `@text/shell.ts`: text
 * lives here rather than inside the components, in English, with no locale segment.
 *
 * ⚠️ **`build` and the three `facts` lines are static chrome**, the same call §8.1 of the
 * spec made for the shell's build tag and uptime: rendered exactly as written, with nothing
 * advancing them. Two of them could be made real — `host` is `window.location.host`, and the
 * record count exists behind `GET /bookmarks` — but not here: this page is served to someone
 * who has no session, so the count is unknowable, and a real host beside two invented numbers
 * would read as an accident rather than a decision. They are furniture; they say "instrument",
 * not "312".
 *
 * `keys stored locally` is the handoff's, and it is about self-hosting — the sibling line on
 * the sign-up screen is `self-hosted · no tracking`. It is **not** a claim about browser
 * storage, which after AUTH 04 holds nothing at all. */

export const AUTH_TEXT = {
  wordmark: "BKMK",
  /** The reduced chrome's one label: which half of the app you are in. */
  screen: "auth",
  /** Static. See the warning above. */
  build: "build 2.4.1 · tls on",

  /** The three mono lines under the card. Aligned with spaces, hence `whitespace-pre`. */
  facts: ["host    bkmk.local:8443", "index   312 records · 1.4 mb", "sync    last 12s ago"],

  about: "about bkmk →",

  /** The left-hand word of the status bar, always in teal. */
  state: "idle",

  login: {
    overline: "session",
    title: "sign in to the index",
    identity: "identity",
    key: "key",
    submit: "connect ↵",
    or: "or",
    switchTo: "register",
    note: "keys stored locally",
    hints: ["↵ connect", "tab next field"],
    /** Shown when the server refuses and says nothing useful about why. */
    failed: "could not sign in",
  },

  /* `overline`, `title` and the two placeholders are the handoff's own words (COS-298). UI 01 had
   * put "account" and "open an index" here, standing in for a screen it was not building. */
  signup: {
    overline: "new account",
    title: "create an index",
    identity: "identity · email",
    identityPlaceholder: "you@domain.tld",
    key: "key",
    keyPlaceholder: "12+ chars",
    confirmKey: "confirm key",
    strength: "strength",

    /* The field the handoff could not know about: password recovery by email is abandoned, so
     * this is the whole of it. `passphraseNote` is not decoration — someone typing here has to
     * know that nothing behind the screen can send them a reset link. */
    passphrase: "recovery passphrase",
    passphraseHint: "20+ chars",
    passphraseNote: "the only way back in if you lose your key — there is no recovery email. write it down.",
    reveal: "show",
    conceal: "hide",

    importLabel: "import my Session Buddy export after signup",

    submit: "register ↵",
    or: "or",
    switchTo: "sign in",
    note: "self-hosted · no tracking",
    hints: ["↵ register", "tab next field"],
    failed: "could not create the account",
  },

  aria: {
    home: "back to sign in",
  },
} as const;
