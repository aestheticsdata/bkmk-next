const router = require("express").Router();
const csrfMiddleware = require("../../auth/csrfMiddleware");
const sessionAuthMiddleware = require("../../auth/sessionAuthMiddleware");
const getCategoriesController = require("../controllers/categories/getCategoriesController");
const catchAsync = require("../../utils/catchAsync");

// Declared once for the whole router — see `bookmarks.js` (COS-294).
router.use(sessionAuthMiddleware, csrfMiddleware);

/* ⚠️ **No `validate()`, because there is nothing left to validate** (COS-306). The route used to take
 * `?userID=`; COS-322 stopped the controller reading it and this ticket stopped the front sending it,
 * so the request is now the session and the path. The two middlewares above are the whole contract. */
router.get("/", catchAsync(getCategoriesController));

module.exports = router;
