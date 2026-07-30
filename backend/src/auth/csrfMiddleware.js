/**
 * The CSRF check (COS-294). Port of `~/dev/pfa/nest-api/src/users/guards/csrf.guard.ts`.
 *
 * Two ways through without a token, both deliberate:
 *
 * - **Safe methods.** GET, HEAD and OPTIONS are not supposed to change anything, and
 *   demanding a header on them would break the very route that hands the token out.
 * - **No authenticated session.** Sign-in and sign-up are unsafe verbs on public routes;
 *   they have no cookie to abuse yet, so there is nothing for CSRF to protect.
 *
 * Mounted per protected router rather than globally, the way pfa decorates each controller
 * with `UseGuards(SessionAuthGuard, CsrfGuard)`. Global mounting would also cover the two
 * public routes above — and would then demand a token from a signed-in visitor who submits
 * the login form again, which is exactly the case the second exemption exists for.
 *
 * It answers 403 itself instead of calling `next(err)`: `errorHandlerMiddleware` is written
 * but never mounted, so `next(err)` reaches Express's default handler and renders HTML.
 * Same reasoning as `middlewares/validate.js`.
 */
const { hasAuthenticatedSession, hasValidCsrfToken, isSafeHttpMethod } = require("./csrfToken");

const csrfMiddleware = (req, res, next) => {
  if (isSafeHttpMethod(req.method)) {
    return next();
  }

  if (!hasAuthenticatedSession(req)) {
    return next();
  }

  if (!hasValidCsrfToken(req)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  return next();
};

module.exports = csrfMiddleware;
