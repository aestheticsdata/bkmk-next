// https://github.com/kelektiv/node-cron#readme
const CronJob = require("cron").CronJob;

const sshCopyDB = require("../helpers/sshRaw").copyDB;

const mysqlDump = () => {
  console.log("mysqlDump", new Date());
  const exec = require("child_process").exec;
  const src = `${process.env.BKMK_DUMP_PATH}bkmkdump.sql`;
  const dest = `${process.env.BKMK_BACKUP_SERVER_PATH}bkmkdump.sql`;
  exec(
    `
    mysqldump -u${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB} > ${process.env.BKMK_DUMP_PATH}bkmkdump.sql
  `,
    /* ⚠️ An arrow, not `sshCopyDB(src, dest)`.
     *
     * Written that way, the copy was *called* here rather than passed, so it started at the same
     * moment as the dump instead of after it — and `exec` got its return value, `undefined`, as
     * its callback. Every run raced the ssh transfer against a file mysqldump was still writing,
     * which is why the offsite copy was empty, truncated, or twelve hours stale. The dump itself
     * was always fine; only what got shipped was wrong.
     *
     * A non-zero exit now skips the copy outright: shipping nothing beats overwriting the last
     * good backup with a broken one. */
    (error, _stdout, stderr) => {
      if (error) {
        console.log("mysqlDump failed, skipping the offsite copy: ", stderr || error.message);
        return;
      }
      sshCopyDB(src, dest);
    },
  );
};

module.exports = () => {
  new CronJob(
    "0 0 */12 * * *", // warning: first star is second, it extends the classic cron syntax
    mysqlDump,
    null,
    true,
  );
};
