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
 * exception to copy living in `@text`. A message that says "20 characters" and a rule that
 * enforces 20 have to change together; two files is how they stop matching. They are written
 * in the screens' voice — lower case, no final stop — because that is where they are read. */

export const SignInPayloadSchema = z.object({
  email: z.email("not an email address").max(FIELD_LIMITS.email),
  /** No minimum, on purpose: it would lock out any account whose password predates the rule
   *  sign-up now applies. See `SECRET_RULES`. */
  password: z.string().min(1, "required"),
});

export type SignInPayload = z.infer<typeof SignInPayloadSchema>;

export const SignUpPayloadSchema = z.object({
  name: z.string().min(1).max(FIELD_LIMITS.userName),
  email: z.email("not an email address").max(FIELD_LIMITS.email),
  password: z.string().min(SECRET_RULES.passwordMin).max(SECRET_RULES.max),
  /** What replaces password recovery by email (COS-298). Required on the way in; the column is
   *  nullable, for the accounts that predate it. */
  recoveryPassphrase: z.string().min(SECRET_RULES.passphraseMin).max(SECRET_RULES.max),
  /** The front sends a date; `addUserController` reformats it to `yyyy-MM-dd`. */
  registerDate: z.union([z.string(), z.date()]),
});

export type SignUpPayload = z.infer<typeof SignUpPayloadSchema>;

/** What the sign-up **form** holds, which is not what the request carries (COS-298).
 *
 *  `confirmKey` and `importAfterSignup` never leave the browser: one is a typo check, the other
 *  chooses where the screen goes next. `name` is not here either — the handoff's sign-up screen
 *  asks for an identity and a key, and `useSignupService` derives the account name from the
 *  address rather than inventing a field the design does not have.
 *
 *  Hence a form schema separate from the payload schema, rather than one schema doing both: a
 *  `confirmKey` in the payload type would be a field the API is free to store. */
export const SignUpFormSchema = z
  .object({
    email: z.email("not an email address").max(FIELD_LIMITS.email),
    password: z
      .string()
      .min(SECRET_RULES.passwordMin, `${SECRET_RULES.passwordMin} characters minimum`)
      .max(SECRET_RULES.max, `${SECRET_RULES.max} characters maximum`),
    confirmPassword: z.string().min(1, "required"),
    recoveryPassphrase: z
      .string()
      .min(SECRET_RULES.passphraseMin, `${SECRET_RULES.passphraseMin} characters minimum — four words or so`)
      /* bcrypt hashes the first 72 bytes and ignores the rest, so a longer passphrase would be
       * checked in part while reading as though all of it counted. */
      .max(SECRET_RULES.max, `${SECRET_RULES.max} characters maximum`),
    importAfterSignup: z.boolean(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "keys do not match",
    /* On the confirm field, not the form: an error with nowhere to go renders above the card,
     * away from the field that is wrong. */
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof SignUpFormSchema>;
