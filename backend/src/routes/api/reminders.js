const router = require("express").Router();
const checkToken = require("../../helpers/checkToken");
const validate = require("../../middlewares/validate");
const { userScopedQuerySchema } = require("../../schemas/bookmarks");
const getRemindersController = require("../controllers/reminders/getRemindersController");
const catchAsync = require("../../utils/catchAsync");

router.get("/", checkToken, validate({ query: userScopedQuerySchema }), catchAsync(getRemindersController));

module.exports = router;
