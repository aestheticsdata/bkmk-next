const router = require("express").Router();
const getBookmarksController = require("../controllers/bookmarks/getBookmarksController");
// const postBookmarkController = require();
const catchAsync = require('../../../../frontend/src/utils/catchAsync');

router.get("/", catchAsync(getBookmarksController));
// router.post("/add", catchAsync(postBookmarkController));

module.exports = router;
