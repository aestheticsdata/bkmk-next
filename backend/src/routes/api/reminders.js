const router = require("express").Router();
const csrfMiddleware = require("../../auth/csrfMiddleware");
const sessionAuthMiddleware = require("../../auth/sessionAuthMiddleware");
const validate = require("../../middlewares/validate");
const { alarmIdParamsSchema, pauseBodySchema } = require("../../schemas/reminders");
const getRemindersController = require("../controllers/reminders/getRemindersController");
const getAlarmLoadController = require("../controllers/reminders/getAlarmLoadController");
const patchAlarmController = require("../controllers/reminders/patchAlarmController");
const patchAlarmsController = require("../controllers/reminders/patchAlarmsController");
const deleteAlarmController = require("../controllers/reminders/deleteAlarmController");
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

/* The three writes (COS-330): `snooze` and `done` on a row, `snooze all` on the whole account.
 *
 * ⚠️ **The collection `PATCH` is declared before the row one.** `/` cannot be swallowed by
 * `/:alarmId`, so this is not load-bearing the way the import routes' order is next door — but
 * reading the wide one first is what keeps it that way if a segment is ever added.
 *
 * `done` is a `DELETE` on the alarm rather than a `PATCH` on the bookmark, because what it removes
 * **is** the alarm: the row goes, and `bookmark.alarm_id` goes with it. See the controller. */
router.patch("/", validate({ body: pauseBodySchema }), catchAsync(patchAlarmsController));

router.patch(
  "/:alarmId",
  validate({ params: alarmIdParamsSchema, body: pauseBodySchema }),
  catchAsync(patchAlarmController),
);

router.delete("/:alarmId", validate({ params: alarmIdParamsSchema }), catchAsync(deleteAlarmController));

module.exports = router;
