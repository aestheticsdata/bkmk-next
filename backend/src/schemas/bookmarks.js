const { z } = require("zod");
const { FIELD_LIMITS } = require("./fieldLimits");
const { categoriesJSONSchema, idSchema, prioritySchema, queryFlagSchema, starsSchema } = require("./primitives");

/* Entrées des routes bookmarks (COS-318).
 *
 * Rappel de lecture : après multer, un corps multipart n'a que des chaînes. Ces schémas
 * décrivent donc le fil, pas l'objet logique du formulaire — voir l'en-tête de
 * `primitives.js`. */

/** `GET /bookmarks` — pagination, tri et filtres, tous dans la query string.
 *
 * `userID` est interpolé tel quel dans le SQL du contrôleur. Le contraindre à un entier
 * ici retire le vecteur d'injection le plus direct de la liste, mais ne remplace pas les
 * requêtes préparées de COS-295 : les autres filtres restent interpolés. */
const listBookmarksQuerySchema = z.object({
  userID: idSchema,
  rows: z.coerce.number().int().positive().max(500),
  page: z.coerce.number().int().min(0).default(0),
  title: z.string().max(FIELD_LIMITS.title).optional(),
  screenshot: queryFlagSchema.optional(),
  url: queryFlagSchema.optional(),
  notes: queryFlagSchema.optional(),
  /** Liste d'identifiants jointe par des virgules. */
  categories_id: z
    .string()
    .regex(/^\d+(,\d+)*$/, "categories_id must be a comma-separated list of integers")
    .optional(),
  reminder: z.coerce.number().int().positive().optional(),
  stars: starsSchema.optional(),
  /** Les huit colonnes du `switch` du contrôleur, préfixées d'un `-` pour l'ordre
   *  descendant. Toute autre valeur y tombait silencieusement dans le `default`. */
  sort: z
    .enum([
      "link",
      "-link",
      "title",
      "-title",
      "stars",
      "-stars",
      "notes",
      "-notes",
      "priority",
      "-priority",
      "screenshot",
      "-screenshot",
      "alarm",
      "-alarm",
      "date",
      "-date",
    ])
    .optional(),
});

const bookmarkIdParamsSchema = z.object({ id: idSchema });

const screenshotQuerySchema = z.object({
  userID: idSchema,
  screenshotFilename: z.string().min(1),
});

const bookmarkBodyShape = {
  title: z.string().min(1).max(FIELD_LIMITS.title),
  /** Le formulaire n'envoie le champ que s'il est rempli, d'où l'`optional`. */
  url: z.string().max(FIELD_LIMITS.url).optional(),
  /** Le formulaire passe les notes par `encodeURIComponent` et la base les stocke ainsi.
   *  D'où la borne triplée : un caractère encodé occupe jusqu'à trois octets (`%C3%A9`),
   *  et c'est la chaîne encodée qui traverse. La vraie limite est celle du front. */
  notes: z
    .string()
    .max(FIELD_LIMITS.notes * 3)
    .optional(),
  stars: starsSchema,
  priority: prioritySchema,
  reminder: z.coerce.number().int().positive().optional(),
  categories: categoriesJSONSchema,
};

const createBookmarkBodySchema = z.object(bookmarkBodyShape);

const updateBookmarkBodySchema = z.object({
  ...bookmarkBodyShape,
  id: idSchema,
  /** Le formulaire envoie la chaîne `"delete"`, jamais un booléen. */
  deleteScreenshot: z.string().optional(),
});

/** `GET /categories` et `GET /reminders` ne prennent que l'identifiant d'utilisateur. */
const userScopedQuerySchema = z.object({ userID: idSchema });

module.exports = {
  listBookmarksQuerySchema,
  bookmarkIdParamsSchema,
  screenshotQuerySchema,
  createBookmarkBodySchema,
  updateBookmarkBodySchema,
  userScopedQuerySchema,
};
