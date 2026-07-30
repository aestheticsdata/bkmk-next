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
const { signInBodySchema, signUpBodySchema } = require("../../schemas/auth");
const signInController = require("../controllers/users/signInController");
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

/* There is no `/resetpassword`, and the commented-out one that sat here is gone with its
 * controller (COS-298). It sent a mail through Sendinblue, with another project's sender: bkmk
 * is self-hosted and has no mail server, so recovery by email was never going to be the answer.
 * What replaces it is the recovery passphrase collected at sign-up; the route that consumes it
 * is AUTH 05 (COS-324), and it belongs here when it lands, public and rate-limited. */

module.exports = router;
