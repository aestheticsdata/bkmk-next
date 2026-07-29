import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
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

export const AuthResponseSchema = z.object({
  /** JWT signed for 10 hours by `signInHelper`. AUTH 01 (COS-293) moves it out of the
   *  response body and into an `httpOnly` cookie — this field disappears then. */
  token: z.string(),
  user: AuthUserSchema,
  /** Not emitted by the backend yet. Optional **on purpose**: making it required now
   *  would break login. AUTH 02 (COS-294) emits it and makes it required here in the
   *  same move. */
  csrfToken: z.string().optional(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/* Outgoing payloads. These carry the `fieldLimits` bounds: they are the only length
 * validation that exists today, on either side. */

export const SignInPayloadSchema = z.object({
  email: z.email().max(FIELD_LIMITS.email),
  password: z.string().min(1),
});

export type SignInPayload = z.infer<typeof SignInPayloadSchema>;

export const SignUpPayloadSchema = z.object({
  name: z.string().min(1).max(FIELD_LIMITS.userName),
  email: z.email().max(FIELD_LIMITS.email),
  password: z.string().min(1),
  /** The front sends a date; `addUserController` reformats it to `yyyy-MM-dd`. */
  registerDate: z.union([z.string(), z.date()]),
});

export type SignUpPayload = z.infer<typeof SignUpPayloadSchema>;
