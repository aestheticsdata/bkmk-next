import { numberLikeSchema } from "@src/schemas/primitives";
import { z } from "zod";

/* Les catégories traversent l'API sous **deux formes différentes**, et c'est le piège
 * de ce fichier (COS-318).
 *
 * `GET /categories` renvoie les lignes brutes de la table : `id` est un `INT`.
 * Les catégories embarquées dans un bookmark, elles, sortent de `GROUP_CONCAT` puis de
 * `marshallCategories`, qui les reconstruit en découpant des chaînes : `id` y est une
 * **chaîne**, et `user_id` n'y est pas du tout.
 *
 * `numberLikeSchema` absorbe l'écart sur `id` ; les deux schémas restent distincts parce
 * que leurs champs le sont. */

/** Une ligne de la table `category` — ce que rend `GET /categories`. */
export const CategorySchema = z.object({
  id: numberLikeSchema,
  name: z.string(),
  color: z.string(),
  user_id: numberLikeSchema,
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoryListSchema = z.array(CategorySchema);

/** Une catégorie telle que `marshallCategories` la recompose dans un bookmark : pas de
 *  `user_id`, et un `id` qui sort d'un découpage de chaîne. */
export const BookmarkCategorySchema = z.object({
  id: numberLikeSchema,
  name: z.string(),
  color: z.string(),
});

export type BookmarkCategory = z.infer<typeof BookmarkCategorySchema>;

/** Ce que le formulaire envoie. `react-select` produit `{ value, label }` ; une catégorie
 *  déjà connue porte en plus son `id`, une catégorie neuve n'en a pas et le back la crée
 *  (`postBookmarkController`). La distinction se lit donc sur la présence de `id`. */
export const CategoryOptionSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]).optional(),
  id: numberLikeSchema.optional(),
});

export type CategoryOption = z.infer<typeof CategoryOptionSchema>;
