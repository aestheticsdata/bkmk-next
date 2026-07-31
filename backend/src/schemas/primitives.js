const { z } = require("zod");

/* Primitives shared by the API's input schemas (COS-318).
 *
 * ⚠️ These schemas **mirror** the front's (`frontend/src/schemas/`), they are not the same
 * objects: the front is TypeScript ESM, the backend CommonJS, and there is no shared
 * package between them. Same situation as pfa, where `nest-api/src/config/field-limits.ts`
 * copies the front's table. The two move together, by hand.
 *
 * And they do not describe quite the same thing: the front describes the **logical**
 * object the form manipulates, the backend describes what arrives **on the wire**. After
 * multer, a multipart body holds nothing but strings — hence the `coerce` calls here. */

/** A row identifier. Coerced because it arrives from a query string or a multipart field,
 *  so always as a string. */
const idSchema = z.coerce.number().int().positive();

/** A boolean carried by a query string, where "present" means true. */
/** A flag in a query string (COS-299 — it was `z.coerce.boolean()`).
 *
 *  Coercion is `Boolean(value)`, and every non-empty string is truthy: `?screenshot=0` and
 *  `?starred=false` both arrived as `true`, switching the filter on. The front only ever writes `1`;
 *  `true` is accepted as well because a hand-typed URL is the case that hits this. */
const queryFlagSchema = z.string().transform((value) => value === "1" || value.toLowerCase() === "true");

const starsSchema = z.coerce.number().int().min(0).max(5);

/** The four levels of `bookmark.priority`, plus the word for "no level at all" (COS-300).
 *
 *  `none` is not a value the column can hold — it is `NULL` — but the filter modal draws it as a
 *  fifth segment (`—`) and it has to travel in the same list as the other four. The controller
 *  splits it back out into an `IS NULL` test. */
const PRIORITY_FILTER_LEVELS = ["low", "medium", "high", "highest", "none"];

/** The three states of the reminder filter (COS-300), as the modal's `any/armed/none/≤ 3d` group
 *  writes them — `any` being the absence of the parameter.
 *
 *  ⚠️ **One enum, not three flags.** The group is a single choice and the states contradict each
 *  other; `?alarm=1&no_alarm=1` would be a request with no answer. It replaces COS-299's `alarm`
 *  flag, which could only say `armed`. */
const ALARM_STATES = ["armed", "none", "due"];

/** `bookmark.priority` — an empty string when nothing is picked; the form sends it that
 *  way and the controller tests `!== ""`. */
const prioritySchema = z.enum(["low", "medium", "high", "highest"]).or(z.literal(""));

/** The form sends categories as **JSON encoded in a string** (multipart carries no
 *  structures), and the controller calls `JSON.parse`. So validate the string *and* what
 *  it contains, before the controller parses it in turn. */
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
  ALARM_STATES,
  idSchema,
  PRIORITY_FILTER_LEVELS,
  queryFlagSchema,
  starsSchema,
  prioritySchema,
  categoriesJSONSchema,
};
