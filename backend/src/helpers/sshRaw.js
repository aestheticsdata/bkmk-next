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

/**
 * The offsite copy of the nightly dump — a promise, unlike its two neighbours above (COS-398).
 *
 * It settles because something now waits on it: `cron/cron-mysql.js` reports the backup's outcome
 * to Zeus, and a copy that only logged its own failure would be reported as a success. That is the
 * exact shape of the bug COS-411 fixed one layer up — the dump was fine, what got shipped was not,
 * and nothing said so.
 *
 * ⚠️ **`conn.on("error")` is not decoration.** ssh2 emits `error` on an unreachable host, and an
 * unhandled `error` event throws out of the event loop — so before this, a backup server that was
 * down did not fail the copy, it killed the API. `connection()` above still has that hole, which
 * is why this does not use it.
 */
module.exports.copyDB = (src, dest) =>
  new Promise((resolve, reject) => {
    const conn = new ssh.Client();

    // Every path below ends here, so the connection is closed exactly once and the promise settles
    // exactly once — `end()` on an already-closed client is a no-op, a second resolve is ignored.
    const done = (error) => {
      conn.end();
      if (error) reject(error);
      else resolve();
    };

    conn.on("error", done);
    conn.on("ready", () =>
      conn.sftp((err, sftp) => {
        if (err) return done(err);

        sftp.fastPut(src, dest, {}, (error) => {
          if (error) {
            console.log("db copy / sftp error: ", error);
            return done(error);
          }
          console.log("successfull bkmk DB backup");
          done();
        });
      }),
    );

    conn.connect(config);
  });
