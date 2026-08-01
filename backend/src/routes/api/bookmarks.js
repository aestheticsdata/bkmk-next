const router = require("express").Router();
const csrfMiddleware = require("../../auth/csrfMiddleware");
const sessionAuthMiddleware = require("../../auth/sessionAuthMiddleware");
const multer = require("multer");
const upload = multer({ limits: { fileSize: 10_000_000 } });
const validate = require("../../middlewares/validate");
const {
  bookmarkIdParamsSchema,
  createBookmarkBodySchema,
  listBookmarksQuerySchema,
  screenshotQuerySchema,
  updateBookmarkBodySchema,
} = require("../../schemas/bookmarks");
const { commitImportBodySchema } = require("../../schemas/import");
const getBookmarksController = require("../controllers/bookmarks/getBookmarksController");
const getBookmarkController = require("../controllers/bookmarks/getBookmarkController");
const postBookmarkController = require("../controllers/bookmarks/postBookmarkController");
const deleteBookmarkController = require("../controllers/bookmarks/deleteBookmarkController");
const editBookmarkController = require("../controllers/bookmarks/editBookmarkController");
const parseImportController = require("../controllers/bookmarks/parseImportController");
const commitImportController = require("../controllers/bookmarks/commitImportController");
const getLastImportController = require("../controllers/bookmarks/getLastImportController");
const getScreenshotController = require("../controllers/bookmarks/getScreenshotController");
const catchAsync = require("../../utils/catchAsync");

/* Every route below is protected, so the policy is declared once here instead of being
 * repeated on each line — the translation of pfa's `UseGuards(SessionAuthGuard, CsrfGuard)`
 * on the whole controller (COS-294). A route added later inherits it and cannot forget it,
 * which the per-route `checkToken` this replaces could not promise. The CSRF check runs
 * before multer, so a forged upload is refused without reading its body. */
router.use(sessionAuthMiddleware, csrfMiddleware);

router.get("/", validate({ query: listBookmarksQuerySchema }), catchAsync(getBookmarksController));

/* The import, in two calls and a reading (COS-307).
 *
 * ⚠️ **Declared before `/:id`, and that is load-bearing.** Express matches in declaration order, so
 * `/import/last` under a `/:id` route would be a request for the record numbered `import` — refused
 * by `bookmarkIdParamsSchema` with a 400, which is a confusing way to lose a route that exists.
 *
 * `POST /upload` is gone with them. It read a file and inserted every line of it, which is what
 * these two replace: `parse` says what is in the file and writes nothing, `POST /import` writes it
 * with the options the screen sends. `validate` sits after multer on the commit, as it does on the
 * other multipart routes — multer is what fills `req.body`. The parse takes no field but the file,
 * so it has nothing to validate.
 *
 * `GET /upload/:id` below is unrelated despite the name: it reads a **screenshot** off the disk. */
router.post("/import/parse", upload.single("bookmark_file"), catchAsync(parseImportController));
router.post(
  "/import",
  [upload.single("bookmark_file"), validate({ body: commitImportBodySchema })],
  catchAsync(commitImportController),
);
router.get("/import/last", catchAsync(getLastImportController));

router.get("/:id", validate({ params: bookmarkIdParamsSchema }), catchAsync(getBookmarkController));
// `validate` after multer: multer is what fills `req.body` on multipart requests.
router.post(
  "/",
  [upload.single("screenshot"), validate({ body: createBookmarkBodySchema })],
  catchAsync(postBookmarkController),
);
router.put(
  "/",
  [upload.single("screenshot"), validate({ body: updateBookmarkBodySchema })],
  catchAsync(editBookmarkController),
);
router.delete("/:id", validate({ params: bookmarkIdParamsSchema }), catchAsync(deleteBookmarkController));
router.get(
  "/upload/:id",
  validate({ params: bookmarkIdParamsSchema, query: screenshotQuerySchema }),
  catchAsync(getScreenshotController),
);

module.exports = router;
