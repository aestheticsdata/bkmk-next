const router = require("express").Router();
const csrfMiddleware = require("../../auth/csrfMiddleware");
const sessionAuthMiddleware = require("../../auth/sessionAuthMiddleware");
const validate = require("../../middlewares/validate");
const { userScopedQuerySchema } = require("../../schemas/bookmarks");
const getRemindersController = require("../controllers/reminders/getRemindersController");
const catchAsync = require("../../utils/catchAsync");

// Declared once for the whole router — see `bookmarks.js` (COS-294).
router.use(sessionAuthMiddleware, csrfMiddleware);

router.get("/", validate({ query: userScopedQuerySchema }), catchAsync(getRemindersController));

module.exports = router;
