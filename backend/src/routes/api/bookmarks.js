const router = require("express").Router();
const checkToken = require("../../helpers/checkToken");
const multer = require("multer");
const upload = multer({ limits: { fileSize: 10_000_000 } });
const getBookmarksController = require("../controllers/bookmarks/getBookmarksController");
const getBookmarkController = require("../controllers/bookmarks/getBookmarkController");
const postBookmarkController = require("../controllers/bookmarks/postBookmarkController");
const deleteBookmarkController = require("../controllers/bookmarks/deleteBookmarkController");
const editBookmarkController = require("../controllers/bookmarks/editBookmarkController");
const catchAsync = require('../../../../frontend/src/utils/catchAsync');

router.get("/", checkToken, catchAsync(getBookmarksController));
router.get("/:id", checkToken, catchAsync(getBookmarkController));
router.post("/", [checkToken, upload.single('screenshot')], catchAsync(postBookmarkController));
router.delete("/:id", checkToken, catchAsync(deleteBookmarkController));
router.put("/", [checkToken, upload.single('screenshot')], catchAsync(editBookmarkController));

module.exports = router;
