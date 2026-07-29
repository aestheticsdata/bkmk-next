const router = require("express").Router();
const checkToken = require("../../helpers/checkToken");
const validate = require("../../middlewares/validate");
const { userScopedQuerySchema } = require("../../schemas/bookmarks");
const getCategoriesController = require("../controllers/categories/getCategoriesController");
const catchAsync = require("../../utils/catchAsync");

router.get("/", checkToken, validate({ query: userScopedQuerySchema }), catchAsync(getCategoriesController));

module.exports = router;
