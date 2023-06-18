const router = require("express").Router();
const checkToken = require("../../helpers/checkToken");
const uploadScreenshot = require("./helpers/customMulter");
const getBookmarksController = require("../controllers/bookmarks/getBookmarksController");
const postBookmarkController = require("../controllers/bookmarks/postBookmarkController");
const catchAsync = require('../../../../frontend/src/utils/catchAsync');

router.get("/", checkToken, catchAsync(getBookmarksController));
router.post("/add", [checkToken, uploadScreenshot.single('screenshot')], catchAsync(postBookmarkController));

module.exports = router;
