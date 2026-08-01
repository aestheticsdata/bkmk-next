const router = require("express").Router();
const csrfMiddleware = require("../../auth/csrfMiddleware");
const sessionAuthMiddleware = require("../../auth/sessionAuthMiddleware");
const getRemindersController = require("../controllers/reminders/getRemindersController");
const getAlarmLoadController = require("../controllers/reminders/getAlarmLoadController");
const catchAsync = require("../../utils/catchAsync");

// Declared once for the whole router — see `bookmarks.js` (COS-294).
router.use(sessionAuthMiddleware, csrfMiddleware);

// No `validate()`: the route takes nothing but the session — see `categories.js` (COS-306).
router.get("/", catchAsync(getRemindersController));

/** The fourteen-day load, aggregated by the database (COS-310). Its own route rather than a field on
 *  the list above: the chart is fourteen rows and the list is every armed alarm, so folding one into
 *  the other would make every render of the table carry a chart it does not read, and the day the
 *  list is paginated the two would need different lifetimes anyway. */
router.get("/load", catchAsync(getAlarmLoadController));

module.exports = router;
