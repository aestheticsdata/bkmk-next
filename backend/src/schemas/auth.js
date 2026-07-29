const { z } = require("zod");
const { FIELD_LIMITS } = require("./fieldLimits");

/* Entrées des routes d'authentification (COS-318).
 *
 * `email` est aujourd'hui interpolé tel quel dans le SQL de `signInController` et
 * `addUserController`. Le valider ici **réduit** la surface, il ne la ferme pas :
 * fermer l'injection veut dire passer aux requêtes préparées, et c'est COS-295. */

const signInBodySchema = z.object({
  email: z.email().max(FIELD_LIMITS.email),
  password: z.string().min(1),
});

const signUpBodySchema = z.object({
  name: z.string().min(1).max(FIELD_LIMITS.userName),
  email: z.email().max(FIELD_LIMITS.email),
  password: z.string().min(1),
  /** Le front envoie un `Date` sérialisé ; le contrôleur le reformate en `yyyy-MM-dd`. */
  registerDate: z.coerce.date(),
});

module.exports = { signInBodySchema, signUpBodySchema };
