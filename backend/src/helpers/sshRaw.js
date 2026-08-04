const ssh = require("ssh2");
const fs = require("fs");

const config = {
  host: process.env.BKMK_BACKUP_SERVER_IP,
  port: 22,
  username: process.env.DEBIAN_OVH_VPS_SSH_USER,
  // password: process.env.DEBIAN_OVH_VPS_SSH_PASSWORD,
  privateKey: process.env.NODE_ENV === "production" && fs.readFileSync(process.env.DEBIAN_OVH_VPS_SSH_KEY_PATH),
};

const connection = (fn) => {
  const conn = new ssh.Client();
  conn.on("ready", fn(conn)).connect(config);
};

module.exports.copy = (src, destDir, filename) => {
  const copy = (conn) => () =>
    conn.sftp((err, sftp) => {
      /* The put, written once and used by both branches below — they only differ in whether the
       * directory had to be created first.
       *
       * ⚠️ **`error` is `undefined` on success, and this used to log it as one** (COS-411). The
       * callback printed `sftp error: <error>` unconditionally, so every successful copy left
       * `sftp error:  undefined` in the log and a real failure looked exactly like the routine
       * line above it. `copyDB` a few lines down has always had the if/else; `copy` never did. */
      const put = () =>
        sftp.fastPut(src, `${destDir}/${filename}`, {}, (error) => {
          if (error) {
            console.log(`screenshot copy / sftp error for ${filename}: `, error);
          } else {
            console.log(`successfull screenshot backup: ${destDir}/${filename}`);
          }
        });

      // when sending pics from phone, copied image is 0 byte
      // adding a 1-minute timeout fixes the issue
      sftp.readdir(destDir, (err) => {
        if (err) {
          // create the directory named after the user ID
          sftp.mkdir(destDir, (mkdirErr) => {
            if (mkdirErr) throw mkdirErr;
            setTimeout(put, 60000);
          });
        } else {
          setTimeout(put, 60000);
        }
      });
    });
  connection(copy);
};

module.exports.deleteFile = (filepath) => {
  const deleteFile = (conn) => () =>
    conn.sftp((err, sftp) => {
      sftp.unlink(filepath);
    });
  connection(deleteFile);
};

module.exports.copyDB = (src, dest) => {
  const copy = (conn) => () =>
    conn.sftp((err, sftp) => {
      sftp.fastPut(src, dest, {}, (error) => {
        if (error) {
          console.log("db copy / sftp error: ", error);
        } else {
          console.log("successfull bkmk DB backup");
        }
      });
    });
  connection(copy);
};
