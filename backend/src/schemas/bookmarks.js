const { z } = require("zod");
const { FIELD_LIMITS } = require("./fieldLimits");
const { categoriesJSONSchema, idSchema, prioritySchema, queryFlagSchema, starsSchema } = require("./primitives");

/* Inputs of the bookmarks routes (COS-318).
 *
 * A reading reminder: after multer, a multipart body holds nothing but strings. These
 * schemas therefore describe the wire, not the form's logical object — see the header of
 * `primitives.js`. */

/** `GET /bookmarks` — pagination, sorting and filters, all in the query string.
 *
 * `userID` is interpolated straight into the controller's SQL. Constraining it to an
 * integer here removes the list's most direct injection vector, but it does not replace
 * COS-295's prepared statements: the other filters are still interpolated. */
const listBookmarksQuerySchema = z.object({
  userID: idSchema,
  rows: z.coerce.number().int().positive().max(500),
  page: z.coerce.number().int().min(0).default(0),
  title: z.string().max(FIELD_LIMITS.title).optional(),
  screenshot: queryFlagSchema.optional(),
  url: queryFlagSchema.optional(),
  notes: queryFlagSchema.optional(),
  /** A comma-joined list of identifiers. */
  categories_id: z
    .string()
    .regex(/^\d+(,\d+)*$/, "categories_id must be a comma-separated list of integers")
    .optional(),
  reminder: z.coerce.number().int().positive().optional(),
  stars: starsSchema.optional(),
  /** The eight columns from the controller's `switch`, prefixed with `-` for descending
   *  order. Any other value used to fall silently into its `default`. */
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
  /** The form only sends the field when it is filled in, hence the `optional`. */
  url: z.string().max(FIELD_LIMITS.url).optional(),
  /** The form runs notes through `encodeURIComponent` and the database stores them that
   *  way. Hence the tripled bound: an encoded character takes up to three bytes
   *  (`%C3%A9`), and it is the encoded string that travels. The real limit is the
   *  front's. */
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
  /** The form sends the string `"delete"`, never a boolean. */
  deleteScreenshot: z.string().optional(),
});

/** `GET /categories` and `GET /reminders` take nothing but the user identifier. */
const userScopedQuerySchema = z.object({ userID: idSchema });

module.exports = {
  listBookmarksQuerySchema,
  bookmarkIdParamsSchema,
  screenshotQuerySchema,
  createBookmarkBodySchema,
  updateBookmarkBodySchema,
  userScopedQuerySchema,
};
