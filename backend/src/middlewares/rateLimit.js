const redisService = require("../redisService");

/**
 * Refusing a public route that is being hammered (COS-324).
 *
 * bkmk had no rate limiting at all, and `signInController`'s own comment says why that mattered
 * before this ticket: an unauthenticated route with no limit is an offer to try every combination.
 * AUTH 05 makes it acute — the recovery passphrase is a **second password**, and whoever guesses it
 * takes the account without ever knowing the first.
 *
 * Counting lives in `redisService`, refusing lives here. The store is the Redis that already holds
 * the sessions, so a restart of the API does not hand an attacker a fresh allowance the way an
 * in-process `Map` would, and a second instance behind the proxy would share the same counters.
 *
 * **Several quotas per route, each with its own key and its own limit.** The recovery route needs
 * two and they answer different questions: the per-email quota bounds how many times *one account*
 * can be attacked, from wherever; the per-IP quota bounds how many accounts *one caller* can walk
 * through. Either alone is trivially sidestepped — rotate the address, or rotate the source.
 *
 * ⚠️ **Mount it after `validate`, not before.** The identifiers are read from `req.validated.body`,
 * so the address a counter is keyed on is one zod has already shaped and bounded rather than
 * whatever arrived. The cost is that a malformed body is refused without being counted — which is
 * the right trade: a request that cannot carry a passphrase is not an attempt at one.
 *
 * A quota whose identifier comes back empty is skipped rather than counted under a placeholder,
 * which would put every such caller in one shared bucket and let them lock each other out.
 */
const TOO_MANY = "too many attempts, try again later";

const rateLimit =
  ({ bucket, windowSeconds, quotas }) =>
  async (req, res, next) => {
    for (const quota of quotas) {
      const identifier = quota.of(req);
      if (!identifier) continue;

      const { exceeded } = await redisService.consumeRateLimit(`${bucket}:${quota.name}`, identifier, {
        limit: quota.limit,
        windowSeconds,
      });

      /* 429 says "later", and it is the one answer on this route that is allowed to differ from the
       * refusal — it describes the caller's own rate, not whether the account exists. It is reached
       * identically for an address that has one and an address that has none, because the counter is
       * incremented before anything is looked up. */
      if (exceeded) return res.status(429).json({ error: TOO_MANY });
    }

    return next();
  };

module.exports = { rateLimit, TOO_MANY };
