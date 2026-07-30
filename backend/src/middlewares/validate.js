/**
 * Request-input validation middleware (COS-318).
 *
 * Used by naming the parts to validate:
 *
 *     router.get("/", validate({ query: listBookmarksQuerySchema }), catchAsync(controller));
 *
 * **It does not replace `req.body` or `req.query`.** The validated result is placed on
 * `req.validated.{body,query,params}`, and the controllers keep reading the original
 * objects. That is deliberate: `z.object` strips unknown keys, and overwriting `req.body`
 * would silently remove a field some legacy controller still reads. Migrating to
 * `req.validated` happens one controller at a time, as each gets rewritten — COS-295 for
 * authentication, the DATA lot for the rest.
 *
 * On failure it answers **400** with the offending fields, rather than the 500 the rest of
 * the API returns to everything — a malformed input is the client's error. It still answers
 * here instead of calling `next(err)`, though the reason has changed: COS-297 mounted the
 * error handler, so `next(err)` would now produce JSON rather than an HTML page. What it
 * would lose is `details`, the list of offending fields, which is the whole value of a 400
 * to a form.
 *
 * On multipart routes, place it **after** multer, otherwise `req.body` is empty.
 */
const validate = (schemas) => (req, res, next) => {
  const validated = {};

  for (const part of ["body", "query", "params"]) {
    const schema = schemas[part];
    if (!schema) continue;

    const result = schema.safeParse(req[part]);
    if (!result.success) {
      return res.status(400).json({
        msg: "invalid request",
        details: result.error.issues.map((issue) => ({
          field: [part, ...issue.path].join("."),
          message: issue.message,
        })),
      });
    }
    validated[part] = result.data;
  }

  req.validated = validated;
  return next();
};

module.exports = validate;
