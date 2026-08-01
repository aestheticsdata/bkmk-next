const { z } = require("zod");

/* Inputs of the import routes (COS-307).
 *
 * The file itself is not described here: multer keeps it out of `req.body`, and what a `.txt` or a
 * `.csv` may contain is `parseImportFile`'s business, not a schema's. What is left on the wire is
 * the two switches under the staged table.
 *
 * ⚠️ **A multipart body carries strings, so a flag is a string** — the reading `queryFlagSchema` was
 * written for in COS-299, for the same reason and after the same bug: `z.coerce.boolean()` is
 * `Boolean(value)`, and every non-empty string is truthy, so `skipDuplicates=0` would have switched
 * the option **on**. Absent means off, which is what a switch nobody sent means.
 *
 * `captureShots` is deliberately absent, and it has been since this schema was written: nothing in
 * this application captures a screenshot from a url, so accepting the flag would have been a promise
 * the API cannot keep. The screen drew the switch anyway, disabled, until COS-394 took it off — the
 * owner keeps taking screenshots by hand, so there is no capture coming for it to wait on. This side
 * never moved, which is the point of having refused the flag rather than accepted and ignored it.
 */
const importFlagSchema = z
  .string()
  .optional()
  .transform((value) => value === "1" || value?.toLowerCase() === "true");

const commitImportBodySchema = z.object({
  skipDuplicates: importFlagSchema,
  tagAsImported: importFlagSchema,
});

module.exports = { commitImportBodySchema };
