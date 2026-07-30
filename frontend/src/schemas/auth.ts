import { FIELD_LIMITS, SECRET_RULES } from "@src/schemas/fieldLimits";
import { numberLikeSchema } from "@src/schemas/primitives";
import { z } from "zod";

/* The authentication boundary (COS-318). `POST /users` (sign in) and `POST /users/add`
 * (sign up) both answer through `signInHelper`, so the shape is identical. */

export const AuthUserSchema = z.object({
  /** `user.id` is an `INT`, so it arrives as a number — while the store typed it as a
   *  string. The store was wrong: it only feeds `?userID=`, where either passed
   *  unnoticed. */
  id: numberLikeSchema,
  name: z.string(),
  email: z.string(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

/** The answer to `POST /users`, `POST /users/add` **and** `GET /users/me` — the three routes
 *  that open or confirm a session all reply with the same two fields.
 *
 *  There is no `token`: AUTH 02 (COS-294) took the JWT out of the body, and AUTH 04 (COS-296)
 *  removed the store that read it. The identity is an `httpOnly` cookie the client never sees,
 *  and `csrfToken` **never goes to storage** — the auth context holds it in memory. */
export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
  csrfToken: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/* Outgoing payloads. These carry the `fieldLimits` bounds: they are the only length
 * validation that exists today, on either side.
 *
 * **The messages live here, next to the numbers they are about** (COS-298), which is the one
 * exception to copy living in `@text`. A message that says "20 chars" and a rule that enforces 20
 * have to change together; two files is how they stop matching. They are written in the screens'
 * voice — lower case, no final stop — because that is where they are read.
 *
 * ⚠️ **Two or three words, never more.** The forms render these beside the field's label rather
 * than under the control, so they cost no height and shift nothing — but the room is what is left
 * of the label's line, and in the sign-up screen's two-column key pair that is about 85px, or
 * eleven of these characters. A longer message wraps the header row, which moves the card, which
 * is the whole thing this arrangement avoids. */

export const SignInPayloadSchema = z.object({
  email: z.email("not an email").max(FIELD_LIMITS.email),
  /** No minimum, on purpose: it would lock out any account whose password predates the rule
   *  sign-up now applies. See `SECRET_RULES`. */
  password: z.string().min(1, "required"),
});

export type SignInPayload = z.infer<typeof SignInPayloadSchema>;

export const SignUpPayloadSchema = z.object({
  name: z.string().min(1).max(FIELD_LIMITS.userName),
  email: z.email("not an email").max(FIELD_LIMITS.email),
  password: z.string().min(SECRET_RULES.passwordMin).max(SECRET_RULES.max),
  /** What replaces password recovery by email (COS-298). Required on the way in; the column is
   *  nullable, for the accounts that predate it. */
  recoveryPassphrase: z.string().min(SECRET_RULES.passphraseMin).max(SECRET_RULES.max),
  /** The front sends a date; `addUserController` reformats it to `yyyy-MM-dd`. */
  registerDate: z.union([z.string(), z.date()]),
});

export type SignUpPayload = z.infer<typeof SignUpPayloadSchema>;

/** The one message the form also raises on its own — live, before the field has been left. Exported
 *  so the two places that can say it cannot end up saying different things. */
export const MISMATCH_MESSAGE = "no match";

/** What the sign-up **form** holds, which is not what the request carries (COS-298).
 *
 *  The two confirmations never leave the browser; they are typo checks. `name` is not here either —
 *  the handoff's sign-up screen asks for an identity and a key, and `useSignupService` derives the
 *  account name from the address rather than inventing a field the design does not have.
 *
 *  Hence a form schema separate from the payload schema, rather than one schema doing both: a
 *  `confirmKey` in the payload type would be a field the API is free to store.
 *
 *  **Both secrets are confirmed, and the passphrase needs it more than the key does.** A mistyped
 *  key is found the next time you sign in, at the cost of one attempt. A mistyped passphrase is
 *  found the day it is needed, which is the day it cannot be repaired — the account has no other
 *  way back in. The reveal toggle on the screen catches the typo you go looking for; this catches
 *  the one you do not.
 *
 *  ⚠️ **One `superRefine`, not five field validators and two `.refine`s.** That was the first shape
 *  and it had a bug worth remembering: zod runs an object's refinements **only if the object itself
 *  parsed**, so while `password` failed its own `min(12)` neither mismatch check ran at all. "no
 *  match" was unreachable for exactly the person who needed it — anyone still typing a short key —
 *  and any field-level failure hid every cross-field rule the same way.
 *
 *  Here the shape is five plain strings, so it always parses and every check below always runs. Each
 *  field reports at most one problem, worst first, on its own `path` so it renders beside the field
 *  it is about rather than above the card.
 *
 *  The length rules restate `SECRET_RULES` instead of composing `z.string().min()`, which is the
 *  price of this arrangement — the constants are shared, so they still cannot drift. */
export const SignUpFormSchema = z
  .object({
    email: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
    recoveryPassphrase: z.string(),
    confirmRecoveryPassphrase: z.string(),
  })
  .superRefine((values, ctx) => {
    const problem = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

    if (!z.email().safeParse(values.email).success) {
      problem("email", "not an email");
    } else if (values.email.length > FIELD_LIMITS.email) {
      problem("email", "too long");
    }

    // `max` is bcrypt's: it hashes the first 72 bytes and ignores the rest, so a longer secret
    // would be checked in part while reading as though all of it counted.
    if (values.password.length < SECRET_RULES.passwordMin) {
      problem("password", `min ${SECRET_RULES.passwordMin} chars`);
    } else if (values.password.length > SECRET_RULES.max) {
      problem("password", `max ${SECRET_RULES.max} chars`);
    }

    if (!values.confirmPassword) {
      problem("confirmPassword", "required");
    } else if (values.confirmPassword !== values.password) {
      problem("confirmPassword", MISMATCH_MESSAGE);
    }

    // `min 20 chars`, not a sentence about word counts: the field's hint already says `20+ chars`,
    // and this has a label's line to fit in, not a paragraph's.
    if (values.recoveryPassphrase.length < SECRET_RULES.passphraseMin) {
      problem("recoveryPassphrase", `min ${SECRET_RULES.passphraseMin} chars`);
    } else if (values.recoveryPassphrase.length > SECRET_RULES.max) {
      problem("recoveryPassphrase", `max ${SECRET_RULES.max} chars`);
    }

    if (!values.confirmRecoveryPassphrase) {
      problem("confirmRecoveryPassphrase", "required");
    } else if (values.confirmRecoveryPassphrase !== values.recoveryPassphrase) {
      problem("confirmRecoveryPassphrase", MISMATCH_MESSAGE);
    }
  });

export type SignUpFormValues = z.infer<typeof SignUpFormSchema>;
