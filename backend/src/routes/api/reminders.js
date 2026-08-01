const router = require("express").Router();
const csrfMiddleware = require("../../auth/csrfMiddleware");
const sessionAuthMiddleware = require("../../auth/sessionAuthMiddleware");
const getRemindersController = require("../controllers/reminders/getRemindersController");
const catchAsync = require("../../utils/catchAsync");

// Declared once for the whole router — see `bookmarks.js` (COS-294).
router.use(sessionAuthMiddleware, csrfMiddleware);

// No `validate()`: the route takes nothing but the session — see `categories.js` (COS-306).
router.get("/", catchAsync(getRemindersController));

module.exports = router;
