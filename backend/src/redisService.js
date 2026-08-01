/**
 * The Redis client, and the one session operation the store cannot express (COS-293).
 *
 * Port of `~/dev/pfa/nest-api/src/redis/redis.service.ts` to CommonJS. Nest gives that file
 * a lifecycle — `onModuleInit` connects, `onModuleDestroy` quits — and Express gives none,
 * so the client is a module singleton and `connect()` is awaited by the bootstrap in
 * `server.js` before the first request can reach the store. The order matters: node-redis
 * rejects every command issued on a client that has not connected.
 *
 * There is no matching shutdown. pm2 restarts this process by signal, nothing is buffered
 * client-side, and the sessions live in Redis rather than in here — so a quit would only
 * add a handler that has to be got right for no gain.
 */
const { createClient } = require("redis");

/**
 * Every key this app owns is namespaced. The Kimsufi box runs one Redis for several apps —
 * pfa already claims `pfa:` — and `clearSessionsForUser` below reads keys by pattern, so
 * the prefix is what keeps it from ever looking at another app's sessions.
 */
const SESSION_PREFIX = "bkmk:";

/**
 * The rate-limit namespace (COS-324), and it is a **sibling** of the sessions' rather than a child.
 *
 * `clearSessionsForUser` below sweeps `bkmk:*` and `JSON.parse`s every value it finds. A counter
 * living under that prefix would be read on every sign-in and would survive it by accident —
 * `JSON.parse("3")` is `3`, whose `.userId` is `undefined`, so the key is skipped. That is the kind
 * of harmless that stops being harmless the day the sweep is rewritten. A separate root costs
 * nothing and keeps the two sets of keys from ever meeting.
 */
const RATE_LIMIT_PREFIX = "bkmk-rl:";

const client = createClient({ url: process.env.REDIS_URL ?? "redis://localhost:6379" });

// Mandatory, not defensive: node-redis emits `error` on a dropped connection, and an
// unhandled `error` event takes the process down. It reconnects on its own, so logging is
// all there is to do here.
client.on("error", (error) => console.error(`[redis] ${error.message}`));

const connect = () => client.connect();

const getClient = () => client;

/**
 * Deletes every session belonging to a user — **one active session per user**. The sign-in
 * route calls it before creating the new session (COS-294), so signing in somewhere else
 * ends the previous session instead of running alongside it.
 *
 * `KEYS` walks the whole keyspace and blocks the server while it does. That is pfa's
 * implementation, kept as is: it runs once per sign-in, over a keyspace holding a handful
 * of ten-minute sessions.
 *
 * The ids are compared as strings. pfa's user id is a string, bkmk's is a MySQL `INT`, and
 * a number on one side of `===` would make the match silently always fail — no error, no
 * deletion, and the guarantee above quietly gone.
 */
const clearSessionsForUser = async (userId) => {
  if (userId === undefined || userId === null) return;

  const target = String(userId);
  const keys = await client.keys(`${SESSION_PREFIX}*`);

  for (const key of keys) {
    try {
      const value = await client.get(key);
      if (!value) continue;

      const session = JSON.parse(value);
      if (String(session.userId) === target) {
        await client.del(key);
      }
    } catch {
      // Skip malformed entries.
    }
  }
};

/**
 * One attempt counted against a fixed window (COS-324). Returns the tally so the caller decides
 * what to do with it — this file counts, `middlewares/rateLimit` refuses.
 *
 * **A fixed window, not a sliding one.** `INCR` creates a missing key at 1 and the `EXPIRE` is set
 * on that first increment only, so the window opens with the first attempt and the ones that follow
 * do not push it back. A sliding window needs a sorted set per key and a `ZREMRANGEBYSCORE` per
 * call; its worst case — twice the limit across a boundary — is understood and is nothing on a
 * self-hosted index with eleven accounts.
 *
 * ⚠️ **The two commands are not atomic, and the failure they can leave is a permanent lockout.** A
 * process that dies between `INCR` and `EXPIRE` leaves a key with no TTL, which never resets and
 * therefore never lets that address or that address's owner through again. So a key found without
 * one — `TTL` answers `-1` — has the window applied to it late rather than never. It is the branch
 * that will not run in practice and the only one whose absence would be silent.
 */
const consumeRateLimit = async (bucket, identifier, { limit, windowSeconds }) => {
  const key = `${RATE_LIMIT_PREFIX}${bucket}:${identifier}`;
  const hits = await client.incr(key);

  if (hits === 1 || (await client.ttl(key)) < 0) {
    await client.expire(key, windowSeconds);
  }

  return { hits, limit, exceeded: hits > limit };
};

module.exports = { SESSION_PREFIX, RATE_LIMIT_PREFIX, clearSessionsForUser, consumeRateLimit, connect, getClient };
