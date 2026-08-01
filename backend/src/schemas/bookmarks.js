const { z } = require("zod");
const { FIELD_LIMITS } = require("./fieldLimits");
const {
  ALARM_STATES,
  categoriesJSONSchema,
  idSchema,
  PRIORITY_FILTER_LEVELS,
  prioritySchema,
  queryFlagSchema,
  starsSchema,
} = require("./primitives");

/* Inputs of the bookmarks routes (COS-318).
 *
 * A reading reminder: after multer, a multipart body holds nothing but strings. These
 * schemas therefore describe the wire, not the form's logical object — see the header of
 * `primitives.js`. */

/** `GET /bookmarks` — pagination, sorting and filters, all in the query string.
 *
 * Since COS-295 the controller passes every filter as a parameter, so none of this is the
 * last line of defence any more. It still earns its keep: `sort` cannot be parameterised —
 * a column name is not a value — so the enum below is what keeps the only interpolation left
 * in that query honest.
 *
 * ⚠️ **`userID` is gone** (COS-306). COS-322 stopped the controllers reading it and deliberately left
 * it on the wire, so that a security fix would not need the front to move; this is the ticket that
 * was named to finish the job, and the front stops sending it in the same change. Removing it from
 * the schema is not a rejection — `z.object` strips unknown keys — so a client that still sends the
 * parameter is served exactly as before. See the note in `getBookmarksController`. */
const listBookmarksQuerySchema = z.object({
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
  /** ⚠️ **A minimum, not an equality** (COS-300). The filter modal offers `any / 1+ / 2+ / 3+ / 4+ /
   *  5`, which is what a rating filter means, and it is also what makes COS-299's separate `starred`
   *  flag unnecessary: "rated at all" is `stars >= 1`. See the controller. */
  stars: starsSchema.optional(),
  /* The index's coarse cuts, as the rail and the filter modal write them.
   *
   * They arrived with COS-299, which had four checkboxes and only one expressible filter behind them
   * (`screenshot` is a presence test; `stars` compared for equality and `reminder` for an exact
   * frequency). COS-300 finished the set and cost two of them their earlier shape:
   *
   * - `starred` is **gone** — `stars` is a minimum now, so the scope is `stars=1`;
   * - `alarm` is an **enum**, not a flag: the modal's reminder group is a single four-way choice
   *   (`any / armed / none / ≤ 3d`) and three booleans could contradict each other;
   * - `reminder` — the exact alarm frequency the legacy filter panel offered as a dropdown — is
   *   **gone with that panel**. Nothing sends it; `alarm=due` answers the question people actually
   *   asked it, "what is about to remind me".
   *
   * Still a down payment on the filter object DATA 01 (COS-306) will formalise, and still in its
   * shape: presence flags beside `screenshot` / `url` / `notes`, a list for `priority`. */
  alarm: z.enum(ALARM_STATES).optional(),
  priority: z
    .string()
    .regex(
      new RegExp(`^(${PRIORITY_FILTER_LEVELS.join("|")})(,(${PRIORITY_FILTER_LEVELS.join("|")}))*$`),
      "priority must be a comma-separated list of levels",
    )
    .optional(),
  /** The columns from the controller's `switch`, prefixed with `-` for descending order. Any other
   *  value used to fall silently into its `default`. `tags` is the last one added (COS-299): it
   *  orders on the aggregated category names, so that every column of the index is sortable, as the
   *  legacy list had it. */
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
      "tags",
      "-tags",
    ])
    .optional(),
});

const bookmarkIdParamsSchema = z.object({ id: idSchema });

/** `GET /bookmarks/upload/:id` — the screenshot is read off the disk by name.
 *
 * The filename is constrained to what `jimpHelper` generates
 * (`screenshot--user-<id>-<uuid>.<ext>`): word characters, dots and hyphens. **No slash and
 * no `..`**, because the controller concatenates this into a path — COS-295 also hardened the
 * read itself with `basename`, and this is the boundary half of the same fix. */
const screenshotQuerySchema = z.object({
  screenshotFilename: z
    .string()
    .min(1)
    .regex(/^[\w.-]+$/, "screenshotFilename must be a bare filename"),
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

/* ⚠️ **`userScopedQuerySchema` was here, and it is gone** (COS-306).
 *
 * It described the one parameter `GET /categories` and `GET /reminders` took — `userID` — and COS-322
 * had already made both controllers ignore it in favour of the session. With the front no longer
 * sending it, the two routes take **no input at all**, and a `z.object({})` validating nothing is a
 * middleware that only looks like a check. So `validate()` came off those two routes rather than
 * being kept around an empty schema; see `routes/api/categories.js`. */

module.exports = {
  listBookmarksQuerySchema,
  bookmarkIdParamsSchema,
  screenshotQuerySchema,
  createBookmarkBodySchema,
  updateBookmarkBodySchema,
};
