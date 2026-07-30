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

module.exports = { signInBodySchema, signUpBodySchema };
