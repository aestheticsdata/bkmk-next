const router = require("express").Router();
const checkToken = require("../../helpers/checkToken");
const postScreenshotUploadController = require("../controllers/screenshot/postScreenshotUploadController");
const catchAsync = require('../../../../frontend/src/utils/catchAsync');

router.post("/", checkToken, catchAsync(postScreenshotUploadController));

module.exports = router;
