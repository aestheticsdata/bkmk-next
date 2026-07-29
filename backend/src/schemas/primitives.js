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
const queryFlagSchema = z.coerce.boolean();

const starsSchema = z.coerce.number().int().min(0).max(5);

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
  idSchema,
  queryFlagSchema,
  starsSchema,
  prioritySchema,
  categoriesJSONSchema,
};
