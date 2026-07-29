import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { numberLikeSchema } from "@src/schemas/primitives";
import { z } from "zod";

/* La frontière d'authentification (COS-318). `POST /users` (connexion) et
 * `POST /users/add` (inscription) répondent tous les deux par `signInHelper`, donc
 * exactement la même forme. */

export const AuthUserSchema = z.object({
  /** `user.id` est un `INT` : il arrive en nombre, alors que le store le typait en
   *  chaîne. C'est le store qui avait tort — il sert à construire `?userID=`, où les
   *  deux passaient sans que personne ne le voie. */
  id: numberLikeSchema,
  name: z.string(),
  email: z.string(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthResponseSchema = z.object({
  /** JWT signé pour 10 h par `signInHelper`. AUTH 01 (COS-293) le sort du corps de la
   *  réponse pour le poser dans un cookie `httpOnly` — ce champ disparaîtra alors. */
  token: z.string(),
  user: AuthUserSchema,
  /** Pas encore émis par le back. Optionnel **volontairement** : le rendre obligatoire
   *  maintenant casserait la connexion. AUTH 02 (COS-294) l'émet et le rend obligatoire
   *  ici dans le même mouvement. */
  csrfToken: z.string().optional(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/* Payloads envoyés. Ce sont eux qui portent les bornes de `fieldLimits` : c'est la seule
 * validation de longueur qui existe aujourd'hui, côté serveur comme côté client. */

export const SignInPayloadSchema = z.object({
  email: z.email().max(FIELD_LIMITS.email),
  password: z.string().min(1),
});

export type SignInPayload = z.infer<typeof SignInPayloadSchema>;

export const SignUpPayloadSchema = z.object({
  name: z.string().min(1).max(FIELD_LIMITS.userName),
  email: z.email().max(FIELD_LIMITS.email),
  password: z.string().min(1),
  /** Le front envoie une date, `addUserController` la reformate en `yyyy-MM-dd`. */
  registerDate: z.union([z.string(), z.date()]),
});

export type SignUpPayload = z.infer<typeof SignUpPayloadSchema>;
