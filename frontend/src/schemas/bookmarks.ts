import { BookmarkCategorySchema, CategoryOptionSchema } from "@src/schemas/categories";
import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { dateLikeSchema, numberLikeSchema, prioritySchema, starsSchema } from "@src/schemas/primitives";
import { z } from "zod";

/* The bookmarks boundary (COS-318).
 *
 * The controllers return `SELECT b.*`: every column of `bookmark`, unmapped, plus a few
 * join aliases. Hence the `snake_case` and the absence of `.strict()` — a column added
 * in the database must not break reads.
 *
 * Nullability is deliberately loose: with no versioned DDL, `.nullish()` is the only
 * honest assumption. See the warning at the top of `primitives.ts`. */

export const BookmarkSchema = z.object({
  id: numberLikeSchema,
  user_id: numberLikeSchema,
  title: z.string(),
  stars: starsSchema,
  priority: prioritySchema.nullish(),
  notes: z.string().nullish(),
  /** A filename, not an image: `getScreenshot` hands it back to `/bookmarks/upload/:id`. */
  screenshot: z.string().nullish(),
  /** Alias of `u.original` — the URL lives in its own table and the join is a
   *  `LEFT JOIN`, so a bookmark with no URL is legitimate. */
  original_url: z.string().nullish(),
  url_id: numberLikeSchema.nullish(),
  alarm_id: numberLikeSchema.nullish(),
  group_id: numberLikeSchema.nullish(),
  date_added: dateLikeSchema.nullish(),
  date_last_modified: dateLikeSchema.nullish(),
  /** Deletion is soft: `deleteBookmarkController` flips `active` to 0 and stamps the
   *  date. The lists already filter on `active = 1`. */
  active: numberLikeSchema.nullish(),
  date_inactive: dateLikeSchema.nullish(),
  /** Always present: `marshallCategories` sets `[]` when there are none. */
  categories: z.array(BookmarkCategorySchema),
});

export type Bookmark = z.infer<typeof BookmarkSchema>;

/** `GET /bookmarks/:id` adds the alarm columns through a join. The controller returns an
 *  **array**, not an object — `res.json(marshalledRows)` on the query result. So the
 *  record screen takes `[0]`. */
export const BookmarkDetailSchema = BookmarkSchema.extend({
  alarm_frequency: numberLikeSchema.nullish(),
  alarm_date_added: dateLikeSchema.nullish(),
});

export type BookmarkDetail = z.infer<typeof BookmarkDetailSchema>;

export const BookmarkDetailResponseSchema = z.array(BookmarkDetailSchema);

/** `GET /bookmarks` — the page, plus the total for pagination. */
export const BookmarkListSchema = z.object({
  rows: z.array(BookmarkSchema),
  total_count: numberLikeSchema,
});

export type BookmarkList = z.infer<typeof BookmarkListSchema>;

/* Payloads.
 *
 * Both create and edit go out as `multipart/form-data` — the screenshot is a file. So
 * everything that is not text gets serialised: `categories` travels as **JSON encoded in
 * a string** (the backend does `JSON.parse(req.body.categories)`), and numbers arrive as
 * strings. These schemas describe the object **before** that serialisation; flattening it
 * is the service's job. */

const bookmarkPayloadShape = {
  title: z.string().min(1).max(FIELD_LIMITS.title),
  url: z.url().max(FIELD_LIMITS.url).or(z.literal("")).optional(),
  notes: z.string().max(FIELD_LIMITS.notes).optional(),
  stars: starsSchema,
  /** Empty string when nothing is picked: the controller tests `priority !== ""`. */
  priority: prioritySchema.or(z.literal("")),
  /** Reminder frequency in days (`@components/common/alarm/constants`). Absent means no
   *  alarm, and on edit that deletes whichever alarm existed. */
  reminder: numberLikeSchema.nullish(),
  categories: z.array(CategoryOptionSchema),
};

export const CreateBookmarkPayloadSchema = z.object(bookmarkPayloadShape);

export type CreateBookmarkPayload = z.infer<typeof CreateBookmarkPayloadSchema>;

export const UpdateBookmarkPayloadSchema = z.object({
  ...bookmarkPayloadShape,
  id: numberLikeSchema,
  /** An explicit flag: without it the controller cannot tell "no new screenshot" from
   *  "remove the screenshot". */
  deleteScreenshot: z.boolean().optional(),
});

export type UpdateBookmarkPayload = z.infer<typeof UpdateBookmarkPayloadSchema>;

/** Writes only return an acknowledgement. Errors take the same shape with a different
 *  message — the HTTP status is what decides, not the body. */
export const BookmarkMutationResponseSchema = z.object({
  msg: z.string(),
});
