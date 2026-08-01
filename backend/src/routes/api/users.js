/**
 * The authentication routes (COS-294).
 *
 * Unlike the other routers, this one mixes public and protected routes, so the middlewares
 * are named per route instead of once for the whole router:
 *
 * - `POST /` and `POST /add` are **public** — they are how you get a session in the first
 *   place. No session check, and no CSRF check either: there is no cookie to abuse yet, which
 *   is the case `csrfMiddleware`'s second exemption exists for.
 * - `GET /me` and `GET /csrf` need a session. Both are safe methods, so the CSRF check would
 *   pass them anyway; it is left off to say so.
 * - `POST /logout` takes the CSRF check but **not** the session check: logging out without a
 *   session is not an error.
 */
const router = require("express").Router();
const csrfMiddleware = require("../../auth/csrfMiddleware");
const sessionAuthMiddleware = require("../../auth/sessionAuthMiddleware");
const validate = require("../../middlewares/validate");
const { rateLimit } = require("../../middlewares/rateLimit");
const { signInBodySchema, signUpBodySchema, recoverBodySchema } = require("../../schemas/auth");
const signInController = require("../controllers/users/signInController");
const recoverController = require("../controllers/users/recoverController");
const addUserController = require("../controllers/users/addUserController");
const getMeController = require("../controllers/users/getMeController");
const getCsrfController = require("../controllers/users/getCsrfController");
const logoutController = require("../controllers/users/logoutController");
const catchAsync = require("../../utils/catchAsync");

router.post("/", validate({ body: signInBodySchema }), catchAsync(signInController));
router.post("/add", validate({ body: signUpBodySchema }), catchAsync(addUserController));
router.get("/me", sessionAuthMiddleware, catchAsync(getMeController));
router.get("/csrf", sessionAuthMiddleware, getCsrfController);
router.post("/logout", csrfMiddleware, logoutController);

/* `/recover` is what that promise became (COS-324). There is still no `/resetpassword`: the
 * commented-out one that sat here went with its controller under COS-298, mail through Sendinblue
 * and another project's sender included.
 *
 * Public, like the two routes above and for the same reason — someone who has lost their key has no
 * session to present. What it does not share with them is that it hands out **nothing** on success:
 * no cookie, no CSRF token, no body worth reading. `csrfMiddleware`'s exemption therefore applies
 * with room to spare.
 *
 * ⚠️ **The order of these three is the whole security posture of the route.** `validate` first, so
 * the limiter keys on an address zod has bounded rather than on whatever arrived; `rateLimit`
 * second, so an attempt is counted before a single `bcrypt` is paid for; the controller last.
 *
 * **Five per address, twenty per source, over a quarter of an hour.** The passphrase is 20
 * characters minimum, so five guesses buy nothing against one that was chosen rather than reused —
 * the quota is there for the other case. The per-IP figure is four times the per-email one because
 * a household, a VPN exit or the proxy itself is one address for several people, and it is the
 * ceiling on how many *accounts* a single caller can walk through rather than on how hard one
 * account can be pushed. */
router.post(
  "/recover",
  validate({ body: recoverBodySchema }),
  rateLimit({
    bucket: "recover",
    windowSeconds: 15 * 60,
    quotas: [
      { name: "email", of: (req) => req.validated.body.email.toLowerCase(), limit: 5 },
      { name: "ip", of: (req) => req.ip, limit: 20 },
    ],
  }),
  catchAsync(recoverController),
);

module.exports = router;
