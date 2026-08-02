/* The two dialogs the account menu opens (COS-404) — `change password` and `set/change recovery
 * passphrase`, the two entries COS-321 drew and left disabled. Same convention as the rest of
 * `@text/*`: English, no locale segment, copy lives here rather than inside the components.
 *
 * Field-length messages live beside `SECRET_RULES` in `@src/schemas/auth.ts`, not here — COS-298's
 * rule, so a bound and the sentence that states it can never drift apart. What is here is
 * everything that is not a validation message: titles, labels, hints, button labels, and the one
 * server refusal both routes can answer. */

export const ACCOUNT_TEXT = {
  password: {
    title: "change password",
    current: "current password",
    next: "new password",
    nextHint: "12+ chars",
    confirmNext: "confirm new password",
    submit: "save ↵",
    cancel: "cancel",
    reveal: "show",
    conceal: "hide",
    /** A wrong current password (400) — the one refusal this form can get back that is not a
     *  field-level validation message. */
    failed: "current password is incorrect",
  },

  passphrase: {
    /** The dialog title switches on `hasRecoveryPassphrase` — there is no third state. */
    titleSet: "set recovery passphrase",
    titleChange: "change recovery passphrase",
    current: "current password",
    next: "recovery passphrase",
    nextHint: "20+ chars",
    confirmNext: "confirm recovery passphrase",
    /** Same warning sign-up gives the same secret (`@text/auth.ts` `signup.passphraseNote`) —
     *  whoever is setting this from the menu needs the same fact. */
    note: "the only way back in if you lose your key — there is no recovery email. write it down.",
    submit: "save ↵",
    cancel: "cancel",
    reveal: "show",
    conceal: "hide",
    failed: "current password is incorrect",
  },
} as const;
