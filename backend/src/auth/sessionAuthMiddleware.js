/**
 * Authentication (COS-294). Port of `~/dev/pfa/nest-api/src/spendings/guards/session-auth.guard.ts`,
 * and the replacement for the two copies of `checkToken.js` this ticket deletes.
 *
 * The identity now comes from the session, so there is nothing to verify: a signed cookie
 * that resolves to a session holding a `userId` *is* the proof. No secret is read here, and
 * no token travels with the request.
 *
 * It answers **401** where `checkToken` answered 200 with `{ success: false }` — a body the
 * client had to inspect to notice it was not signed in. `useRequestHelper`'s interceptor
 * keys off the status code (COS-296), and so does anything else that will ever call this API.
 *
 * `req.user` replaces `req.decoded`, whose name only made sense for a decoded JWT. The three
 * controllers that read it are updated with this ticket.
 */
const sessionAuthMiddleware = (req, res, next) => {
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Session required" });
  }

  req.user = { id: userId };
  return next();
};

module.exports = sessionAuthMiddleware;
