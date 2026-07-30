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
const getBookmarksController = require("../controllers/bookmarks/getBookmarksController");
const getBookmarkController = require("../controllers/bookmarks/getBookmarkController");
const postBookmarkController = require("../controllers/bookmarks/postBookmarkController");
const deleteBookmarkController = require("../controllers/bookmarks/deleteBookmarkController");
const editBookmarkController = require("../controllers/bookmarks/editBookmarkController");
const uploadBookmarksControoler = require("../controllers/bookmarks/uploadBookmarksController");
const getScreenshotController = require("../controllers/bookmarks/getScreenshotController");
const catchAsync = require("../../utils/catchAsync");

/* Every route below is protected, so the policy is declared once here instead of being
 * repeated on each line — the translation of pfa's `UseGuards(SessionAuthGuard, CsrfGuard)`
 * on the whole controller (COS-294). A route added later inherits it and cannot forget it,
 * which the per-route `checkToken` this replaces could not promise. The CSRF check runs
 * before multer, so a forged upload is refused without reading its body. */
router.use(sessionAuthMiddleware, csrfMiddleware);

router.get("/", validate({ query: listBookmarksQuerySchema }), catchAsync(getBookmarksController));
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
// No body schema here: the payload is the file itself, which multer keeps out of
// `req.body`. Parsing it lives in the controller — see `schemas/import.ts` on the front.
router.post("/upload", upload.single("bookmark_file"), catchAsync(uploadBookmarksControoler));
router.get(
  "/upload/:id",
  validate({ params: bookmarkIdParamsSchema, query: screenshotQuerySchema }),
  catchAsync(getScreenshotController),
);

module.exports = router;
