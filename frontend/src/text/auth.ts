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
 * **Neither screen carries the handoff's aside any more** (COS-298). It ended the action row with
 * `keys stored locally` on sign-in and `self-hosted · no tracking` on sign-up; both were built and
 * both were dropped as decoration. The first was also misleading on its face — it reads as a claim
 * about browser storage, which since AUTH 04 holds nothing at all.
 *
 * **The status bars keep one hint each**, the key that submits. `tab next field` went with the
 * asides: Tab moves between fields in every form on the web, and a hint nobody needs is furniture
 * that has to be read before it can be ignored. */

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
    /** The handoff writes `sign in to the index`; plain `sign in` on the owner's call — you sign in
     *  to bkmk, and the index is what is behind the door rather than the door. See `signup.title`. */
    title: "sign in",
    identity: "identity",
    key: "key",
    submit: "connect ↵",
    or: "or",
    switchTo: "register",
    hints: ["↵ connect"],
    /** Shown when the server refuses and says nothing useful about why. */
    failed: "could not sign in",
  },

  /* The two placeholders are the handoff's own words (COS-298). UI 01 had put "account" and "open an
   * index" here, standing in for a screen it was not building.
   *
   * ⚠️ **The titles are not the handoff's.** It writes `create an index` and `sign in to the index`,
   * on the reading that the product's word for the collection is "the index" — which it is, in About
   * and in the facts block. Changed to `create an account` and `sign in` on the owner's call: the
   * screens name the act, not the thing behind it, and a visitor with no account yet has no index to
   * create. Change them back here and nowhere else if that reading ever wins.
   *
   * ⚠️ **No `importLabel`.** The handoff draws `[x] import my Session Buddy export after signup`
   * under the card; it was built, then dropped on the owner's call — registering and importing are
   * two decisions, and pinning the second to a checkbox on the first only buys a redirect. The
   * import screen is reachable from the chrome once you are in. */
  signup: {
    overline: "new account",
    title: "create an account",
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
    /* Stacked under the passphrase rather than beside it, unlike `key` / `confirm key`: the pair is
     * long enough that two half-width columns would wrap mid-phrase. */
    confirmPassphrase: "confirm passphrase",
    passphraseNote: "the only way back in if you lose your key — there is no recovery email. write it down.",
    reveal: "show",
    conceal: "hide",

    submit: "register ↵",
    or: "or",
    switchTo: "sign in",
    hints: ["↵ register"],
    failed: "could not create the account",
  },

  aria: {
    home: "back to sign in",
  },
} as const;
