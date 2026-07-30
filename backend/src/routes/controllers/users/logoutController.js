/**
 * `POST /users/logout` (COS-294) — ends the session server-side.
 *
 * Three steps, and none of them is optional. `clearCsrfToken` first, so a token captured
 * from this session cannot be replayed. `session.destroy` removes the record from Redis,
 * which is what actually revokes it — an `httpOnly` cookie cannot be deleted by the client,
 * so a session left in the store stays valid for whoever holds the cookie. `clearCookie`
 * then tidies the browser's side.
 *
 * Guarded by the CSRF check but **not** by the session check, as in pfa: logging out without
 * a session is not an error, it is already the desired state.
 *
 * It answers its own 500 rather than calling `next(err)` — `errorHandlerMiddleware` is
 * written but never mounted, so `next(err)` renders Express's HTML page.
 */
const { SESSION_COOKIE_NAME } = require("../../../auth/constants");
const { clearCsrfToken } = require("../../../auth/csrfToken");

module.exports = (req, res) => {
  clearCsrfToken(req);

  req.session.destroy((error) => {
    if (error) {
      console.error(`[logout] ${error.message}`);
      return res.status(500).json({ error: "Could not end the session" });
    }

    res.clearCookie(SESSION_COOKIE_NAME);
    return res.json({ ok: true });
  });
};
