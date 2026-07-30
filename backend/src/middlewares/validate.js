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
 * On failure it answers **400** with the offending fields. It answers here rather than
 * calling `next(err)`: the server has no error handler wired, so `next(err)` falls through
 * to Express's, which renders an HTML page. And 400 rather than the 500 the rest of the
 * API returns to everything — a malformed input is the client's error.
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
