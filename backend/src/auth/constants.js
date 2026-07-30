/**
 * The two session values `server.js` and `logoutController.js` both need. They live here
 * rather than in `server.js` because a controller cannot require the entry point back
 * without booting a second server.
 */

/** Ten minutes, pfa's figure — an inactivity timeout, since `rolling: true` refreshes it. */
const SESSION_TTL_SECONDS = 10 * 60;

/** Must match the `name` given to `express-session`, or logout clears nothing. */
const SESSION_COOKIE_NAME = "bkmk.sid";

module.exports = { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS };
