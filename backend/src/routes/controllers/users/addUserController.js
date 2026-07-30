const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const { format } = require("date-fns");
const dbConnection = require("../../../db/dbinitmysql");
const establishSession = require("./helpers/signInHelper");

/**
 * Registering (COS-298).
 *
 * **Two secrets are hashed here, not one.** The recovery passphrase replaces password recovery
 * by email — bkmk is self-hosted and has no mail server — so it is stored exactly like the
 * password: same bcrypt, same cost, same 60-character column. It is never compared here;
 * AUTH 05 (COS-324) is what consumes it.
 *
 * **`bcrypt` is awaited rather than called back.** The previous version nested `genSalt` inside
 * `hash` inside the request, and had to explain in a comment why the session write was awaited
 * from the callback's own `try`. Adding a second hash would have nested a fourth level and put
 * the only error handling for it three closures deep. `bcrypt.hash(secret, 10)` generates its
 * own salt and returns a promise, `catchAsync` catches what it rejects with, and since COS-297
 * mounted the error handler that lands as JSON instead of an HTML page.
 *
 * The two hashes run in sequence, not in parallel: bcrypt at cost 10 is ~100ms of CPU each, and
 * `Promise.all` on a single-threaded process would only interleave them, not shorten them.
 *
 * The fields come from `req.validated.body` — the shape `signUpBodySchema` accepted, unknown
 * keys stripped. A missing field can no longer reach this file, so the `Please enter all fields`
 * guard the old version opened with is gone: `validate` answers 400 before the controller runs,
 * which is both the right status and the right place.
 */
module.exports = async (req, res, next) => {
  const { name, email, password, recoveryPassphrase, registerDate } = req.validated.body;

  const conn = await dbConnection();

  try {
    // Prepared, not interpolated (COS-295) — same unauthenticated `email` as the sign-in route,
    // same fix.
    const [existing] = await conn.execute("SELECT id FROM user WHERE email = ?;", [email]);
    if (existing.length > 0) {
      // 409, not 500: the request was understood and refused because the address is taken. The
      // sign-up screen shows this message inline, so it has to arrive as a real status (COS-297).
      // Unlike sign-in, saying so is not an oracle — whoever is registering is being told about
      // an address they just typed and could already test by trying to log in.
      return next(createError(409, "Email already exists"));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const passphraseHash = await bcrypt.hash(recoveryPassphrase, 10);

    const [created] = await conn.execute(
      `INSERT INTO user (name, password, recovery_passphrase, email, register_date)
       VALUES (?, ?, ?, ?, ?);`,
      [name, passwordHash, passphraseHash, email, format(registerDate, "yyyy-MM-dd")],
    );

    return await establishSession(req, res, { id: created.insertId, name, email }, 201);
  } finally {
    await conn.end();
  }
};
