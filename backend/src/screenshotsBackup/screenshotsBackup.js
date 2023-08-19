const sshCopy = require('../helpers/sshRaw').copy;

module.exports = invoicesImagesBackup = (userDir, filename, userID) => {
  const destDir = `${process.env.BKMK_BACKUP_INVOICES_SERVER_PATH}${userID}`;
  const localPath = userDir+"/"+filename;
  sshCopy(localPath, destDir, filename);
};
