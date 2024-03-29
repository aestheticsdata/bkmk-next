const router = require("express").Router();
const checkToken = require("../../helpers/checkToken");
const getRemindersController = require("../controllers/reminders/getRemindersController");
const catchAsync = require('../../utils/catchAsync');

router.get("/", checkToken, catchAsync(getRemindersController));

module.exports = router;
