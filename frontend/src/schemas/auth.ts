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
