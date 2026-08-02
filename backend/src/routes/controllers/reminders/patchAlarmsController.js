const dbConnection = require("../../../db/dbinitmysql");
const pauseAlarms = require("./helpers/pauseAlarms");

/* `PATCH /reminders` — `snooze all` and `resume all` (COS-330).
 *
 * **No `404` to give, and no read to give it with.** The row-level route needs one because an
 * identifier can name someone else's alarm; this one names none, so its scope *is* the session, and
 * an account with nothing to move is a request that succeeded and moved nothing. `moved` says which
 * of the two happened, and it is the guard in `pauseAlarms` that makes the count meaningful: alarms
 * already asleep are neither counted nor rewritten.
 *
 * **One statement rather than a loop over the list.** The browser is holding the alarms, but sending
 * them back to be named one by one would let the first and the last fall asleep on two different
 * days over a slow connection — and the day they fell asleep is exactly what waking subtracts. */
module.exports = async (req, res) => {
  const { paused } = req.validated.body;

  const conn = await dbConnection();

  try {
    const moved = await pauseAlarms(conn, { userId: req.user.id, paused });

    return res.status(200).json({ msg: paused ? "alarms paused" : "alarms resumed", moved });
  } catch (e) {
    return res.status(500).json({ msg: `error updating alarms : ${e}` });
  } finally {
    await conn.end();
  }
};
