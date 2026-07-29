const { z } = require("zod");
const { FIELD_LIMITS } = require("./fieldLimits");

/* Inputs of the authentication routes (COS-318).
 *
 * `email` is interpolated straight into the SQL of `signInController` and
 * `addUserController` today. Validating it here **narrows** the surface, it does not
 * close it: closing the injection means prepared statements, and that is COS-295. */

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
