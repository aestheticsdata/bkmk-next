/** What both auth forms collect. Required, not optional: since COS-297 the fields go through
 *  `SignInPayloadSchema` before `onSubmit` is ever called, so a caller no longer has to assert
 *  they are there. */
export interface LoginValues {
  email: string;
  password: string;
}

/** The words that differ between signing in and registering. The shapes in `@text/auth.ts`
 *  satisfy this, which is what lets one form render both screens. */
export interface AuthFormCopy {
  identity: string;
  key: string;
  submit: string;
  or: string;
  switchTo: string;
  note: string;
}

export interface SharedLoginFormProps {
  copy: AuthFormCopy;
  /** Where `copy.switchTo` goes — the other auth screen. */
  switchHref: string;
  onSubmit: (values: LoginValues) => Promise<void>;
  /** What the server said, if it refused. Rendered inside the card, not as a toast. */
  error?: string | null;
}
