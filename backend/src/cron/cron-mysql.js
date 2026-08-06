// https://github.com/kelektiv/node-cron#readme
const CronJob = require("cron").CronJob;
const { promisify } = require("node:util");
const exec = promisify(require("node:child_process").exec);
const fs = require("node:fs/promises");

const sshCopyDB = require("../helpers/sshRaw").copyDB;
const { withZeusReport } = require("../helpers/zeusReport");

/* Reported to Zeus verbatim, which is what lets it flag this cron as overdue when it stops firing
 * (COS-398). Six fields — the first is seconds, node-cron's extension to the classic syntax — and
 * Zeus's parser reads it the same way: 00:00 and 12:00. No timezone is passed with it because this
 * `CronJob` pins none, so it fires in the box's zone, which is what Zeus already assumes. */
const SCHEDULE = "0 0 */12 * * *";

const mysqlDump = async () => {
  console.log("mysqlDump", new Date());

  const src = `${process.env.BKMK_DUMP_PATH}bkmkdump.sql`;
  const dest = `${process.env.BKMK_BACKUP_SERVER_PATH}bkmkdump.sql`;

  /* ⚠️ **`await`, and the offsite copy on the line after it** (COS-411).
   *
   * This was once `exec(cmd, sshCopyDB(src, dest))` — the copy *called* rather than passed, so it
   * started at the same moment as the dump instead of after it, and `exec` got its return value,
   * `undefined`, as its callback. Every run raced the ssh transfer against a file mysqldump was
   * still writing, which is why the offsite copy was empty, truncated, or twelve hours stale. The
   * dump itself was always fine; only what got shipped was wrong.
   *
   * A non-zero exit throws here, which skips the copy outright: shipping nothing beats overwriting
   * the last good backup with a broken one. */
  try {
    await exec(`
    mysqldump -u${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB} > ${src}
  `);
  } catch (error) {
    console.log("mysqlDump failed, skipping the offsite copy: ", error.stderr || error.message);
    throw new Error(`mysqldump failed: ${error.stderr || error.message}`);
  }

  const { size } = await fs.stat(src);

  /* Awaited, so a backup server that is unreachable or a transfer that dies half way is a failed
   * run in Zeus rather than a green one. The local dump is good either way — but a backup whose
   * only offsite copy silently stopped moving is the failure worth being told about. */
  await sshCopyDB(src, dest);

  return {
    summary: `dumped to ${src} (${Math.round(size / 1024)} KB), copied offsite`,
    detail: { bytes: size, dest },
  };
};

module.exports = () => {
  new CronJob(
    SCHEDULE,
    /* The tick catches, and it has to. `mysqlDump` now rejects on a failure it used to only log,
     * `withZeusReport` rethrows after reporting — and a rejection escaping a `CronJob` tick is an
     * unhandled rejection, which under node's default takes the whole API down. A backup that
     * fails must not do more damage than the backup was worth. */
    () => {
      withZeusReport("db-backup", SCHEDULE, mysqlDump).catch((error) =>
        console.log("mysqlDump run failed: ", error.message),
      );
    },
    null,
    true,
  );
};
