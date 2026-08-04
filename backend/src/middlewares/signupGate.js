/**
 * Refusing sign-ups while the instance is locked down to its owner (COS-416).
 *
 * Mounted first on `POST /users/add`, ahead of `validate` — a disabled instance must never
 * reach the DB lookup or `bcrypt`, whatever the body contains. Same string-comparison idiom
 * as `COOKIE_SECURE` in `server.js`: `SIGNUPS_ENABLED` is compared against the literal string
 * `"false"`, not parsed as a boolean, and stays enabled if unset so other checkouts of this
 * codebase are unaffected by default.
 *
 * The front disables the sign-up form's fields and submit button for the same reason, but that
 * alone is not a security control — this is the actual gate; the front is only the visible half
 * of it.
 */
const SIGNUPS_DISABLED = "sign-ups are currently disabled";

const signupGate = (_req, res, next) => {
  if (process.env.SIGNUPS_ENABLED === "false") {
    return res.status(403).json({ error: SIGNUPS_DISABLED });
  }

  return next();
};

module.exports = { signupGate, SIGNUPS_DISABLED };
