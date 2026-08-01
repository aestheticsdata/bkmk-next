const router = require("express").Router();
const csrfMiddleware = require("../../auth/csrfMiddleware");
const sessionAuthMiddleware = require("../../auth/sessionAuthMiddleware");
const multer = require("multer");
const upload = multer({ limits: { fileSize: 10_000_000 } });
const validate = require("../../middlewares/validate");
const { rateLimit } = require("../../middlewares/rateLimit");
const {
  bookmarkIdParamsSchema,
  createBookmarkBodySchema,
  duplicatesQuerySchema,
  exportQuerySchema,
  listBookmarksQuerySchema,
  pageTitleQuerySchema,
  screenshotQuerySchema,
  updateBookmarkBodySchema,
} = require("../../schemas/bookmarks");
const { commitImportBodySchema } = require("../../schemas/import");
const getBookmarksController = require("../controllers/bookmarks/getBookmarksController");
const getBookmarkController = require("../controllers/bookmarks/getBookmarkController");
const postBookmarkController = require("../controllers/bookmarks/postBookmarkController");
const deleteBookmarkController = require("../controllers/bookmarks/deleteBookmarkController");
const exportBookmarksController = require("../controllers/bookmarks/exportBookmarksController");
const getDuplicatesController = require("../controllers/bookmarks/getDuplicatesController");
const getPageTitleController = require("../controllers/bookmarks/getPageTitleController");
const getStatsController = require("../controllers/bookmarks/getStatsController");
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

/** Is this page already in the index (COS-308). Declared above `/:id` for the same reason the import
 *  routes are: `/duplicates` under a `/:id` route is a request for the record numbered `duplicates`,
 *  refused with a 400 by `bookmarkIdParamsSchema`. */
router.get("/duplicates", validate({ query: duplicatesQuerySchema }), catchAsync(getDuplicatesController));

/* What the page at this address calls itself (COS-329). Above `/:id` for the reason the routes
 * above it are.
 *
 * ⚠️ **The only route here that makes the server open a connection to an address the caller chose**,
 * so it is the only one that carries a quota of its own. `fetchPageTitle` holds the other half — the
 * scheme, the address ranges, the timeout and the byte cap — and this bounds how *often* a signed-in
 * caller can spend one of those requests. Keyed on the session's user rather than on `req.ip`: every
 * request here has a session by the time it arrives, and a household behind one address is several
 * people filling in several forms.
 *
 * **Sixty per five minutes** is the shape of a form, not of a crawler. The field asks once per url,
 * on blur, and only when the title is still empty — so a person filling the screen in honestly does
 * not reach ten. */
router.get(
  "/page-title",
  validate({ query: pageTitleQuerySchema }),
  rateLimit({
    bucket: "pageTitle",
    windowSeconds: 5 * 60,
    quotas: [{ name: "user", of: (req) => String(req.user?.id ?? ""), limit: 60 }],
  }),
  catchAsync(getPageTitleController),
);

/** The whole index, out (COS-333). Above `/:id` for the reason the two routes above it are. */
router.get("/export", validate({ query: exportQuerySchema }), catchAsync(exportBookmarksController));

/** The rail's `storage` block (COS-310) — records held and how many carry a screenshot. Above
 *  `/:id` like the three routes before it, and with no `validate()` because it takes nothing but the
 *  session: the numbers are the whole index's, never the current query's. */
router.get("/stats", catchAsync(getStatsController));

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
