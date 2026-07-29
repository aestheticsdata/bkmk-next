const { z } = require("zod");

/* Primitives partagées par les schémas d'entrée de l'API (COS-318).
 *
 * ⚠️ Ces schémas **miroitent** ceux du front (`frontend/src/schemas/`), ils ne sont pas
 * les mêmes objets : le front est en TypeScript ESM, le back en CommonJS, et il n'y a
 * pas de paquet partagé entre les deux. C'est la même situation que pfa, où
 * `nest-api/src/config/field-limits.ts` recopie la table du front. Les deux bougent
 * ensemble, à la main.
 *
 * Et ils ne décrivent pas tout à fait la même chose : le front décrit l'objet **logique**
 * que manipule le formulaire, le back décrit ce qui arrive **sur le fil**. Après multer,
 * un corps multipart n'a que des chaînes — d'où les `coerce` ici. */

/** Un identifiant de ligne. Coercition parce qu'il arrive d'une query string ou d'un
 *  champ multipart, donc toujours en chaîne. */
const idSchema = z.coerce.number().int().positive();

/** Un booléen porté par une query string, où « présent » vaut vrai. */
const queryFlagSchema = z.coerce.boolean();

const starsSchema = z.coerce.number().int().min(0).max(5);

/** `bookmark.priority` — chaîne vide quand rien n'est choisi, le formulaire l'envoie
 *  telle quelle et le contrôleur teste `!== ""`. */
const prioritySchema = z.enum(["low", "medium", "high", "highest"]).or(z.literal(""));

/** Le formulaire envoie les catégories en **JSON encodé dans une chaîne** (multipart ne
 *  transporte pas de structures), et le contrôleur fait `JSON.parse`. On valide donc la
 *  chaîne *et* ce qu'elle contient, avant que le contrôleur ne la parse à son tour. */
const categoriesJSONSchema = z.string().transform((value, ctx) => {
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    ctx.addIssue({ code: "custom", message: "categories is not valid JSON" });
    return z.NEVER;
  }
  const result = z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.union([z.string(), z.number()]).optional(),
        id: idSchema.optional(),
      }),
    )
    .safeParse(parsed);
  if (!result.success) {
    ctx.addIssue({ code: "custom", message: "categories has the wrong shape" });
    return z.NEVER;
  }
  return result.data;
});

module.exports = {
  idSchema,
  queryFlagSchema,
  starsSchema,
  prioritySchema,
  categoriesJSONSchema,
};
