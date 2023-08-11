// https://github.com/kelektiv/node-cron#readme
const CronJob = require('cron').CronJob;

const sshCopy = require('../helpers/sshRaw').copy;

const mysqlDump = () => {
  console.log('mysqlDump', new Date());
  const exec = require('child_process').exec;
  const src = `${process.env.BKMK_DUMP_PATH}bkmkdump.sql`;
  const dest = `${process.env.BKMK_BACKUP_SERVER_PATH}bkmkdump.sql`;
  exec(`
    mysqldump -u${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB} > ${process.env.BKMK_DUMP_PATH}bkmkdump.sql
  `,
    sshCopy(src, dest),
  );
}

module.exports = () => {
  new CronJob(
    '0 0 */12 * * *', // warning: first star is second, it extends the classic cron syntax
    mysqlDump,
    null,
    true,
  );
}
