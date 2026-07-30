/**
 * `GET /users/csrf` (COS-294) — hands back the session's CSRF token.
 *
 * The client's copy lives in memory, so it is gone after a reload and after any interceptor
 * replay. This is the one route that can restore it, which is why it is a safe method: the
 * CSRF check exempts GET, otherwise recovering a lost token would require the lost token.
 *
 * Not wrapped in `catchAsync` — it is synchronous, and `catchAsync` calls `.catch()` on what
 * the handler returns.
 */
const { getOrCreateCsrfToken } = require("../../../auth/csrfToken");

module.exports = (req, res) => res.json({ csrfToken: getOrCreateCsrfToken(req) });
