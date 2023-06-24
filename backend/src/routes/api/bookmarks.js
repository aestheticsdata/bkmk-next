const router = require("express").Router();
const checkToken = require("../../helpers/checkToken");
const multer = require("multer");
const upload = multer({ limits: { fileSize: 32_097_152 } });
const getBookmarksController = require("../controllers/bookmarks/getBookmarksController");
const getBookmarkController = require("../controllers/bookmarks/getBookmarkController");
const postBookmarkController = require("../controllers/bookmarks/postBookmarkController");
const catchAsync = require('../../../../frontend/src/utils/catchAsync');

router.get("/", checkToken, catchAsync(getBookmarksController));
router.get("/:id", checkToken, catchAsync(getBookmarkController));
router.post("/add", [checkToken, upload.single('screenshot')], catchAsync(postBookmarkController));

module.exports = router;
