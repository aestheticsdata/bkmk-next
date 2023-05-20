const router = require("express").Router();
const checkToken = require("../../helpers/checkToken");
const getBookmarksController = require("../controllers/bookmarks/getBookmarksController");
// const postBookmarkController = require();
const catchAsync = require('../../../../frontend/src/utils/catchAsync');

router.get("/", checkToken, catchAsync(getBookmarksController));
// router.post("/add", catchAsync(postBookmarkController));

module.exports = router;
