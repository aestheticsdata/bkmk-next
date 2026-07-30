const { z } = require("zod");
const { FIELD_LIMITS } = require("./fieldLimits");

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

const signUpBodySchema = z.object({
  name: z.string().min(1).max(FIELD_LIMITS.userName),
  email: z.email().max(FIELD_LIMITS.email),
  password: z.string().min(1),
  /** The front sends a serialised `Date`; the controller reformats it to `yyyy-MM-dd`. */
  registerDate: z.coerce.date(),
});

module.exports = { signInBodySchema, signUpBodySchema };
