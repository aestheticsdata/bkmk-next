/* The copy each auth form needs (COS-298). The shapes in `@text/auth.ts` satisfy these, which is
 * what keeps the words out of the components.
 *
 * Two forms, not one with a flag: since sign-up gained a confirm field, a strength gauge, a
 * recovery passphrase and an import checkbox, a shared component would be four conditionals deep
 * to render a screen with two fields. What the two genuinely share is the card, the action row and
 * the field-plus-error pair, and those are shared as components rather than as branches. */

/** The bottom row of the card: the button and the way to the other screen.
 *
 *  **No aside.** The handoff ends this row with a line pushed to the right on each screen —
 *  `keys stored locally` on sign-in, `self-hosted · no tracking` on sign-up. Both were built and
 *  both were dropped on the owner's call: they are decoration, and one of them ("keys stored
 *  locally") reads as a claim about the browser on a screen where nothing is stored in it at all. */
export interface AuthActionCopy {
  submit: string;
  or: string;
  switchTo: string;
}

export interface SignInCopy extends AuthActionCopy {
  identity: string;
  key: string;
  /** The second way out of this card, and the only screen that has one (COS-324). It sits in the
   *  card's footer band rather than in the action row since COS-402. */
  recoverAccount: string;
}

export interface SignUpCopy extends AuthActionCopy {
  identity: string;
  identityPlaceholder: string;
  key: string;
  keyPlaceholder: string;
  confirmKey: string;
  strength: string;
  passphrase: string;
  passphraseHint: string;
  confirmPassphrase: string;
  /** Why the field exists at all — there is no recovery email behind it. */
  passphraseNote: string;
  reveal: string;
  conceal: string;
}

/** The recovery screen (COS-324). It borrows sign-in's `identity` and sign-up's passphrase and key
 *  pair, because it is the same two acts in one card: proving the secret you kept, choosing the one
 *  you lost. `note` says the thing neither of the others has to — that an account with no passphrase
 *  ends here, which the server will never say out loud. */
export interface RecoverCopy extends AuthActionCopy {
  identity: string;
  identityPlaceholder: string;
  passphrase: string;
  passphraseHint: string;
  key: string;
  keyPlaceholder: string;
  confirmKey: string;
  reveal: string;
  conceal: string;
  note: string;
}
