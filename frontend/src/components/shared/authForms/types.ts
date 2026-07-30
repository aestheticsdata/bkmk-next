/* The copy each auth form needs (COS-298). The shapes in `@text/auth.ts` satisfy these, which is
 * what keeps the words out of the components.
 *
 * Two forms, not one with a flag: since sign-up gained a confirm field, a strength gauge, a
 * recovery passphrase and an import checkbox, a shared component would be four conditionals deep
 * to render a screen with two fields. What the two genuinely share is the card, the action row and
 * the field-plus-error pair, and those are shared as components rather than as branches. */

/** The bottom row of the card: the button, the way to the other screen, and the aside. */
export interface AuthActionCopy {
  submit: string;
  or: string;
  switchTo: string;
  note: string;
}

export interface SignInCopy extends AuthActionCopy {
  identity: string;
  key: string;
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
  /** Why the field exists at all — there is no recovery email behind it. */
  passphraseNote: string;
  reveal: string;
  conceal: string;
  importLabel: string;
}
