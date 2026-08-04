const sshCopy = require("../helpers/sshRaw").copy;

/* The off-site copy of a bookmark's screenshot (COS-411).
 *
 * ⚠️ **The variable is `…_SCREENSHOTS_…`, and reading the wrong one is silent.** This line asked
 * for `BKMK_BACKUP_INVOICES_SERVER_PATH` — a pfa name, carried over with the file — while the
 * environment has only ever defined `BKMK_BACKUP_SCREENSHOTS_SERVER_PATH`. An absent variable is
 * `undefined`, and `undefined` in a template literal is the string "undefined", so the
 * destination resolved to `undefined3` for user 3 and sftp created it without complaining.
 * Twenty-one months of screenshots went there instead of `screenshotsUpload/3`.
 *
 * Nothing in the path can fail loudly on its own: the copy succeeds, the directory is created on
 * demand, and the only trace is a folder whose name is a JavaScript accident. So the guard is
 * here rather than in a log line nobody reads — a missing variable now stops the copy and says
 * which name it wanted.
 *
 * The trailing slash belongs to the variable (`/home/debian/screenshotsUpload/`), which is why
 * the user id is concatenated rather than joined. */
module.exports = (userDir, filename, userID) => {
  const backupRoot = process.env.BKMK_BACKUP_SCREENSHOTS_SERVER_PATH;

  if (!backupRoot) {
    console.error("screenshots backup skipped: BKMK_BACKUP_SCREENSHOTS_SERVER_PATH is not set");
    return;
  }

  const destDir = `${backupRoot}${userID}`;
  const localPath = `${userDir}/${filename}`;
  sshCopy(localPath, destDir, filename);
};
