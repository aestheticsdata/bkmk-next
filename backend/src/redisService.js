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

module.exports = { SESSION_PREFIX, clearSessionsForUser, connect, getClient };
