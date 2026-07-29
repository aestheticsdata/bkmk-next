import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { starsSchema } from "@src/schemas/primitives";
import { z } from "zod";

/* L'objet de filtres de l'index (COS-318).
 *
 * Il n'a pas de frontière réseau à lui : il vit dans la **query string**, la modale
 * l'écrit et `useBookmarks` le relit pour le repasser tel quel au back. C'est donc une
 * frontière quand même — celle de l'URL, où tout est chaîne et où n'importe qui peut
 * écrire n'importe quoi.
 *
 * Deux formes, et il faut les deux : celle du formulaire, typée, et celle de l'URL, où
 * les booléens sont des `1` et les listes des chaînes jointes par des virgules. */

/** Les valeurs telles que la modale les manipule. */
export const FiltersSchema = z.object({
  /** Recherche plein texte sur le titre. Le back en fait un `LIKE` en remplaçant les
   *  virgules par des `%`, si bien qu'une suite de mots devient une recherche « dans cet
   *  ordre, avec du texte entre ». */
  title: z.string().max(FIELD_LIMITS.title).optional(),
  /** Présence, pas valeur : « seulement ceux qui ont une capture ». Idem pour les trois
   *  suivants — le back teste `IS NOT NULL`. */
  screenshot: z.boolean().optional(),
  url: z.boolean().optional(),
  notes: z.boolean().optional(),
  categories_id: z.array(z.coerce.number().int()).optional(),
  /** Fréquence de rappel exacte, en jours. */
  reminder: z.coerce.number().int().positive().optional(),
  /** Nombre d'étoiles exact, pas un minimum : le back compare avec `=`. */
  stars: starsSchema.optional(),
});

export type Filters = z.infer<typeof FiltersSchema>;

/** La même chose vue depuis l'URL. Tout est chaîne, les drapeaux valent `"1"`, et les
 *  catégories arrivent jointes par des virgules. `catch` plutôt que `optional` sur les
 *  champs numériques : une query string trafiquée doit être ignorée, pas faire échouer
 *  le rendu de la page. */
export const FiltersQuerySchema = z.object({
  page: z.coerce.number().int().min(0).catch(0),
  title: z.string().optional(),
  screenshot: z.coerce.boolean().optional(),
  url: z.coerce.boolean().optional(),
  notes: z.coerce.boolean().optional(),
  categories_id: z
    .string()
    .transform((value) => value.split(",").map(Number).filter(Number.isInteger))
    .optional(),
  reminder: z.coerce.number().int().positive().optional().catch(undefined),
  stars: starsSchema.optional().catch(undefined),
  /** Colonne de tri, préfixée d'un `-` pour l'ordre descendant. La liste est celle du
   *  `switch` de `getBookmarksController` : toute autre valeur y tombe dans le `default`
   *  et ne trie rien. */
  sort: z
    .enum(["link", "title", "stars", "notes", "priority", "screenshot", "alarm", "date"])
    .or(z.enum(["-link", "-title", "-stars", "-notes", "-priority", "-screenshot", "-alarm", "-date"]))
    .optional()
    .catch(undefined),
});

export type FiltersQuery = z.infer<typeof FiltersQuerySchema>;
