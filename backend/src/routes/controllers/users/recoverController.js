const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const dbConnection = require("../../../db/dbinitmysql");
const redisService = require("../../../redisService");

/**
 * `POST /users/recover` — the recovery passphrase spent (COS-324, AUTH 05).
 *
 * UI 02 has been collecting a passphrase since COS-298 and nothing consumed it; this is what makes
 * it worth having. Recovery by email was abandoned on 2026-07-30 — bkmk is self-hosted and has no
 * mail server, and the controller that tried went out with COS-298 — so the passphrase is the whole
 * of the recovery story, and it is a **second password**: whoever guesses it takes the account.
 * Everything below follows from that one sentence.
 *
 * ⚠️ **No session is opened.** The answer is a bare 200 and the screen sends you to `/login`, where
 * the new key is proved once more. Signing someone in on the strength of the secret they just said
 * they had lost is the one shortcut this route must not take, and it costs the user one form.
 */
const REFUSED = "invalid credentials";

/**
 * A real bcrypt hash of bytes nobody will ever type, compared against when there is nothing else to
 * compare against.
 *
 * ⚠️ **This is the timing half of "the same answer either way".** Returning early for an unknown
 * address makes the route answer in a millisecond where a known one takes the ~100ms of a `compare`
 * at cost 10 — which is an account oracle you can read with a stopwatch, on exactly the route where
 * the message was carefully made identical. So the comparison runs whatever happens, and it has to
 * run against a **valid** hash: `bcrypt.compare` returns false immediately for a malformed one and
 * the difference comes straight back.
 *
 * Generated at load rather than written into the file: it costs one hash at boot, and a constant
 * committed to a public repository is a value an attacker can rule out.
 */
const DECOY_HASH = bcrypt.hashSync(crypto.randomBytes(32).toString("hex"), 10);

module.exports = async (req, res, next) => {
  const { email, recoveryPassphrase, password } = req.validated.body;

  const conn = await dbConnection();

  try {
    const [rows] = await conn.execute("SELECT id, recovery_passphrase FROM user WHERE email = ?;", [email]);
    const user = rows[0];

    /* One `compare`, three refusals behind it. The address is unknown, or the account predates the
     * column and has `NULL` — both fall on `DECOY_HASH` — or the passphrase is simply wrong. Same
     * status, same sentence, same duration.
     *
     * **An account with no passphrase is not recoverable, and that is the design.** There is no
     * out-of-band channel left, so the only way back is the owner in MySQL; the user menu (COS-321)
     * is where the accounts that predate the column set one. Saying so here would be telling an
     * anonymous caller which accounts are defenceless. */
    const matches = await bcrypt.compare(recoveryPassphrase, user?.recovery_passphrase ?? DECOY_HASH);

    if (!user?.recovery_passphrase || !matches) {
      return next(createError(401, REFUSED));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await conn.execute("UPDATE user SET password = ? WHERE id = ?;", [passwordHash, user.id]);

    /* ⚠️ **Every session of this account falls, and it falls after the password is written.**
     *
     * A reset is what you do when you think someone else has your key, so leaving their session
     * alive would be resetting nothing — `clearSessionsForUser` has existed since AUTH 01 (COS-293)
     * and does exactly this. The order matters the other way round too: dropped first, an `UPDATE`
     * that then failed would have signed the owner out of an account whose password never changed. */
    await redisService.clearSessionsForUser(user.id);

    return res.status(200).json({ msg: "password reset" });
  } finally {
    await conn.end();
  }
};
