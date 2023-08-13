const router = require("express").Router();
const checkToken = require("../../helpers/checkToken");
const getCategoriesController = require("../controllers/categories/getCategoriesController");
const catchAsync = require('../../utils/catchAsync');

router.get("/", checkToken, catchAsync(getCategoriesController));

module.exports = router;

