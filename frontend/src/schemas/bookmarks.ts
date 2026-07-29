import { BookmarkCategorySchema, CategoryOptionSchema } from "@src/schemas/categories";
import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { dateLikeSchema, numberLikeSchema, prioritySchema, starsSchema } from "@src/schemas/primitives";
import { z } from "zod";

/* La frontière des bookmarks (COS-318).
 *
 * Les contrôleurs renvoient `SELECT b.*` : toutes les colonnes de `bookmark`, sans
 * mapping, plus quelques alias de jointure. D'où le `snake_case` et l'absence de
 * `.strict()` — une colonne ajoutée en base ne doit pas casser la lecture.
 *
 * Nullabilité volontairement large : sans DDL versionné, `.nullish()` est la seule
 * hypothèse honnête. Voir l'avertissement en tête de `primitives.ts`. */

export const BookmarkSchema = z.object({
  id: numberLikeSchema,
  user_id: numberLikeSchema,
  title: z.string(),
  stars: starsSchema,
  priority: prioritySchema.nullish(),
  notes: z.string().nullish(),
  /** Nom de fichier, pas une image : `getScreenshot` le repasse à `/bookmarks/upload/:id`. */
  screenshot: z.string().nullish(),
  /** Alias de `u.original` — l'URL vit dans sa propre table et la jointure est un
   *  `LEFT JOIN`, donc un bookmark sans URL est légitime. */
  original_url: z.string().nullish(),
  url_id: numberLikeSchema.nullish(),
  alarm_id: numberLikeSchema.nullish(),
  group_id: numberLikeSchema.nullish(),
  date_added: dateLikeSchema.nullish(),
  date_last_modified: dateLikeSchema.nullish(),
  /** La suppression est logique : `deleteBookmarkController` bascule `active` à 0 et
   *  horodate. Les listes filtrent déjà sur `active = 1`. */
  active: numberLikeSchema.nullish(),
  date_inactive: dateLikeSchema.nullish(),
  /** Toujours présent : `marshallCategories` pose `[]` quand il n'y en a pas. */
  categories: z.array(BookmarkCategorySchema),
});

export type Bookmark = z.infer<typeof BookmarkSchema>;

/** `GET /bookmarks/:id` ajoute les colonnes de l'alarme par jointure. Le contrôleur
 *  renvoie un **tableau**, pas un objet — `res.json(marshalledRows)` sur le résultat de
 *  la requête. La fiche prend donc `[0]`. */
export const BookmarkDetailSchema = BookmarkSchema.extend({
  alarm_frequency: numberLikeSchema.nullish(),
  alarm_date_added: dateLikeSchema.nullish(),
});

export type BookmarkDetail = z.infer<typeof BookmarkDetailSchema>;

export const BookmarkDetailResponseSchema = z.array(BookmarkDetailSchema);

/** `GET /bookmarks` — la page, plus le total pour la pagination. */
export const BookmarkListSchema = z.object({
  rows: z.array(BookmarkSchema),
  total_count: numberLikeSchema,
});

export type BookmarkList = z.infer<typeof BookmarkListSchema>;

/* Payloads.
 *
 * Création comme édition partent en `multipart/form-data` — la capture est un fichier.
 * Tout ce qui n'est pas texte est donc sérialisé : `categories` voyage en **JSON encodé
 * dans une chaîne** (le back fait `JSON.parse(req.body.categories)`), et les nombres
 * arrivent en chaînes. Ces schémas décrivent l'objet **avant** cette sérialisation ;
 * c'est le service qui l'aplatit. */

const bookmarkPayloadShape = {
  title: z.string().min(1).max(FIELD_LIMITS.title),
  url: z.url().max(FIELD_LIMITS.url).or(z.literal("")).optional(),
  notes: z.string().max(FIELD_LIMITS.notes).optional(),
  stars: starsSchema,
  /** Chaîne vide quand rien n'est choisi : le contrôleur teste `priority !== ""`. */
  priority: prioritySchema.or(z.literal("")),
  /** Fréquence de rappel en jours (`@components/common/alarm/constants`). Absente = pas
   *  d'alarme, et l'édition supprime alors celle qui existait. */
  reminder: numberLikeSchema.nullish(),
  categories: z.array(CategoryOptionSchema),
};

export const CreateBookmarkPayloadSchema = z.object(bookmarkPayloadShape);

export type CreateBookmarkPayload = z.infer<typeof CreateBookmarkPayloadSchema>;

export const UpdateBookmarkPayloadSchema = z.object({
  ...bookmarkPayloadShape,
  id: numberLikeSchema,
  /** Drapeau explicite : sans lui, le contrôleur ne peut pas distinguer « pas de nouvelle
   *  capture » de « retirer la capture ». */
  deleteScreenshot: z.boolean().optional(),
});

export type UpdateBookmarkPayload = z.infer<typeof UpdateBookmarkPayloadSchema>;

/** Les écritures ne renvoient qu'un accusé. Les erreurs prennent la même forme, avec un
 *  message différent — c'est le code HTTP qui tranche, pas le corps. */
export const BookmarkMutationResponseSchema = z.object({
  msg: z.string(),
});
