import { numberLikeSchema } from "@src/schemas/primitives";
import { z } from "zod";

/* Categories cross the API in **two different shapes**, and that is this file's trap
 * (COS-318).
 *
 * `GET /categories` returns raw table rows, where `id` is an `INT`. The categories
 * embedded in a bookmark come out of a `GROUP_CONCAT` that `marshallCategories` rebuilds
 * by splitting strings: there `id` is a **string**, and `user_id` is absent entirely.
 *
 * `numberLikeSchema` absorbs the difference on `id`; the two schemas stay separate
 * because their fields genuinely differ. */

/** A row of the `category` table — what `GET /categories` returns. */
export const CategorySchema = z.object({
  id: numberLikeSchema,
  name: z.string(),
  color: z.string(),
  user_id: numberLikeSchema,
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoryListSchema = z.array(CategorySchema);

/** A category as `marshallCategories` rebuilds it inside a bookmark: no `user_id`, and
 *  an `id` that came out of splitting a string. */
export const BookmarkCategorySchema = z.object({
  id: numberLikeSchema,
  name: z.string(),
  color: z.string(),
});

export type BookmarkCategory = z.infer<typeof BookmarkCategorySchema>;

/** What the form sends. `react-select` produces `{ value, label }`; a category that
 *  already exists also carries its `id`, a new one does not and the backend creates it
 *  (`postBookmarkController`). The distinction is read off the presence of `id`. */
export const CategoryOptionSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]).optional(),
  id: numberLikeSchema.optional(),
});

export type CategoryOption = z.infer<typeof CategoryOptionSchema>;
