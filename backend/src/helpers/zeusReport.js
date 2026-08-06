/**
 * Zeus cron reporting — the CommonJS port of Zeus's `docs/reporting/zeus-report.ts` (COS-398).
 *
 * Zeus discovers nothing. A cron exists on its `/cron` page from the moment the app POSTs a run,
 * and a cron that stops firing is only *noticed* because Zeus knows the schedule and stops seeing
 * reports for it. That is the whole value here: bkmk's dump has run twice a day since April and
 * Zeus had no idea it existed.
 *
 * **The standard is the HTTP contract, not this file.** Zeus validates every field and answers
 * `400 <field>` to anything off-contract. If this helper and Zeus ever disagree, Zeus is right.
 *
 * Configured by three variables in `ecosystem.config.prod.js`:
 *
 *     ZEUS_INGEST_URL=http://127.0.0.1:6600/api/cron-runs
 *     ZEUS_INGEST_TOKEN=<the same value as Zeus's own ZEUS_INGEST_TOKEN>
 *     ZEUS_APP_NAME=bkmk
 *
 * `ZEUS_APP_NAME` must already exist in Zeus's port registry — an unknown app is a `400`. Crons
 * need no registration at all: one appears the first time it reports.
 */

const TIMEOUT_MS = 2000;

/* Read at call time, never at module load. pm2 injects the environment before node starts, so a
 * module-level `const` would work in production — and read `undefined` on a laptop, where nothing
 * sets these at all. An unconfigured client no-ops by design, so the two environments would
 * disagree in the quietest possible way. Reading here keeps them honest. */
const settings = () => ({
  url: process.env.ZEUS_INGEST_URL,
  token: process.env.ZEUS_INGEST_TOKEN,
  app: process.env.ZEUS_APP_NAME,
});

const report = async (body) => {
  const { url, token, app } = settings();

  // Unconfigured is a silent no-op, deliberately: bkmk has to run identically on a laptop with no
  // Zeus in sight and on ks-b with one.
  //
  // ⚠️ **`url` has no default, and must not grow one.** A fallback would be a copy of Zeus's own
  // port compiled into bkmk — the one place a port reassignment (COS-173) cannot rewrite, since it
  // only knows a service's own ecosystem and nginx files. And because this function swallows every
  // error by contract, a stale default fails in the worst available way: no error, no log, the
  // backup simply stops appearing on `/cron`. Absent means absent.
  if (!url || !token || !app) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ app, ...body }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    // Never propagates, never retries. Zeus being down cannot break a backup, and no retry means
    // no duplicate report — which is why Zeus needs no idempotency key.
  }
};

/**
 * Runs `fn` and reports the outcome to Zeus once, when it ends.
 *
 * `fn` resolves to `{ status, summary, detail }`, all optional — `status` defaults to `ok`, and
 * `skipped` means the job ran and found nothing to do. A throw is reported as `failed` and then
 * **rethrown unchanged**: reporting observes the job, it does not handle it. The caller still owns
 * what a failure means, which for a `CronJob` tick means catching it — an escaping rejection is an
 * unhandled rejection, and that takes the whole server down.
 *
 * `schedule` is the expression from the job itself, copied verbatim; 5 or 6 fields both parse.
 * Passing it is what buys overdue detection: without it, a cron that stops firing simply stops
 * appearing, which is exactly the failure this exists to catch.
 *
 * `timezone` is for a job that pins one. bkmk's `CronJob` does not, so it fires in the process's
 * zone — the box's, `Etc/UTC` — which is what Zeus already assumes. Leave it out.
 */
const withZeusReport = async (cron, schedule, fn, timezone) => {
  const startedAt = new Date();

  try {
    const outcome = (await fn()) ?? {};

    await report({
      cron,
      schedule,
      timezone,
      status: outcome.status ?? "ok",
      startedAt: startedAt.toISOString(),
      durationMs: Date.now() - startedAt.getTime(),
      summary: outcome.summary,
      detail: outcome.detail,
    });
  } catch (error) {
    await report({
      cron,
      schedule,
      timezone,
      status: "failed",
      startedAt: startedAt.toISOString(),
      durationMs: Date.now() - startedAt.getTime(),
      // 200 chars is the contract, and Zeus rejects a longer one whole rather than truncating it —
      // which would lose the one report it is least acceptable to lose.
      summary: error instanceof Error ? error.message.slice(0, 200) : "unknown error",
    });

    throw error;
  }
};

module.exports = { withZeusReport };
