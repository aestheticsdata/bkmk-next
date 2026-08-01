const { z } = require("zod");
const { FIELD_LIMITS, SECRET_RULES } = require("./fieldLimits");

/* Inputs of the authentication routes (COS-318).
 *
 * These used to be the only thing standing between `req.body.email` and the SQL of
 * `signInController` and `addUserController`, which interpolated it. COS-295 made both
 * statements prepared, so this is back to being what it should be: a bound on the shape and
 * the length of what the client may send, not a patch over an injection. */

const signInBodySchema = z.object({
  email: z.email().max(FIELD_LIMITS.email),
  password: z.string().min(1),
});

/* Sign-up bounds both secrets, where sign-in bounds neither (COS-298).
 *
 * The asymmetry is deliberate. A minimum on `POST /users` would lock out any of the accounts
 * created before the rule whose password is shorter than it — the rule can only apply to
 * secrets being chosen now. The ceiling is bcrypt's 72 bytes; `SECRET_RULES` explains it.
 *
 * `recoveryPassphrase` is required here and nullable in the column: the accounts that predate
 * it keep `NULL`, and set one from the user menu (COS-321). Nothing new arrives without one. */
const signUpBodySchema = z.object({
  name: z.string().min(1).max(FIELD_LIMITS.userName),
  email: z.email().max(FIELD_LIMITS.email),
  password: z.string().min(SECRET_RULES.passwordMin).max(SECRET_RULES.max),
  recoveryPassphrase: z.string().min(SECRET_RULES.passphraseMin).max(SECRET_RULES.max),
  /** The front sends a serialised `Date`; the controller reformats it to `yyyy-MM-dd`. */
  registerDate: z.coerce.date(),
});

/* Recovering (COS-324) — the three fields `/recover` sends, and the only route that bounds a
 * secret it is going to *check* rather than store.
 *
 * `recoveryPassphrase` carries sign-up's minimum on purpose, where `signInBodySchema.password`
 * carries none. The asymmetry above is about not locking out secrets chosen before the rule; there
 * are none here, because the column arrived with the rule — every passphrase that exists was
 * accepted by `signUpBodySchema` or set from the user menu (COS-321), so a shorter one cannot be
 * the right answer and refusing it early costs an attacker a round trip rather than a `bcrypt`.
 *
 * `password` is the **new** key and is bounded exactly like sign-up's, because that is what it is:
 * a secret being chosen now. */
const recoverBodySchema = z.object({
  email: z.email().max(FIELD_LIMITS.email),
  recoveryPassphrase: z.string().min(SECRET_RULES.passphraseMin).max(SECRET_RULES.max),
  password: z.string().min(SECRET_RULES.passwordMin).max(SECRET_RULES.max),
});

module.exports = { signInBodySchema, signUpBodySchema, recoverBodySchema };
