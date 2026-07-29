const router = require("express").Router();
const checkToken = require("../../helpers/checkToken");
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

router.get("/", checkToken, validate({ query: listBookmarksQuerySchema }), catchAsync(getBookmarksController));
router.get("/:id", checkToken, validate({ params: bookmarkIdParamsSchema }), catchAsync(getBookmarkController));
// `validate` after multer: multer is what fills `req.body` on multipart requests.
router.post(
  "/",
  [checkToken, upload.single("screenshot"), validate({ body: createBookmarkBodySchema })],
  catchAsync(postBookmarkController),
);
router.put(
  "/",
  [checkToken, upload.single("screenshot"), validate({ body: updateBookmarkBodySchema })],
  catchAsync(editBookmarkController),
);
router.delete("/:id", checkToken, validate({ params: bookmarkIdParamsSchema }), catchAsync(deleteBookmarkController));
// No body schema here: the payload is the file itself, which multer keeps out of
// `req.body`. Parsing it lives in the controller — see `schemas/import.ts` on the front.
router.post("/upload", checkToken, upload.single("bookmark_file"), catchAsync(uploadBookmarksControoler));
router.get(
  "/upload/:id",
  checkToken,
  validate({ params: bookmarkIdParamsSchema, query: screenshotQuerySchema }),
  catchAsync(getScreenshotController),
);

module.exports = router;
