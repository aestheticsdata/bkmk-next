const ssh = require("ssh2");
const fs = require("fs");

const config = {
  host: process.env.BKMK_BACKUP_SERVER_IP,
  port: 22,
  username: process.env.DEBIAN_OVH_VPS_SSH_USER,
  // password: process.env.DEBIAN_OVH_VPS_SSH_PASSWORD,
  privateKey: process.env.NODE_ENV === "production" && fs.readFileSync(process.env.DEBIAN_OVH_VPS_SSH_KEY_PATH),
};

/**
 * Opens an sftp session, hands it to `fn`, and closes the connection once `fn` calls `done`.
 *
 * ⚠️ **The `error` listeners are the point.** ssh2 emits `error` when the host is unreachable or
 * the handshake times out, and an unhandled `error` event throws out of the event loop — so this
 * helper used to turn "the backup server is down" into "the bkmk API is down", which is a far worse
 * outage than the one it was reporting. It also never called `conn.end()`, so every screenshot
 * saved leaked a connection for the life of the process. `copyDB` below was given this treatment
 * first (COS-432) and is the model.
 *
 * Failures are surfaced by logging, not by rejecting, because both callers are fire-and-forget:
 * `jimpHelper.createScreenshot` does not await the screenshot backup, and `deleteFile` has no
 * caller at all. Handing them a promise that rejects would only trade an unhandled `error` event
 * for an unhandled rejection — the same crash wearing a different hat. `copyDB` returns a promise
 * precisely because `cron/cron-mysql.js` does wait on it.
 */
const connection = (label, fn) => {
  const conn = new ssh.Client();

  /* Every path below ends here, so the connection is closed exactly once. The guard is load-bearing
   * rather than defensive: a transfer that fails is usually followed by the socket erroring too, so
   * `done` gets called a second time on a client that is already ended. */
  let settled = false;
  const done = () => {
    if (settled) return;
    settled = true;
    conn.end();
  };

  conn.on("error", (error) => {
    console.error(`${label} / ssh error: `, error);
    done();
  });

  conn.on("ready", () =>
    conn.sftp((err, sftp) => {
      if (err) {
        console.error(`${label} / sftp session error: `, err);
        return done();
      }

      /* The sftp stream can outlive the connection: `copy` waits a full minute before it puts, and
       * if the link dies in between, the put lands on a closed stream. Without a listener here that
       * arrives as an unhandled `error` event — the exact crash this helper exists to prevent. */
      sftp.on("error", (sftpErr) => {
        console.error(`${label} / sftp stream error: `, sftpErr);
        done();
      });

      fn(sftp, done);
    }),
  );

  conn.connect(config);
};

module.exports.copy = (src, destDir, filename) => {
  connection(`screenshot copy ${filename}`, (sftp, done) => {
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
        done();
      });

    // when sending pics from phone, copied image is 0 byte
    // adding a 1-minute timeout fixes the issue
    sftp.readdir(destDir, (err) => {
      if (err) {
        // create the directory named after the user ID
        sftp.mkdir(destDir, (mkdirErr) => {
          /* ⚠️ **This used to `throw`.** Thrown from an sftp callback there is no caller left on the
           * stack to catch it, so a backup server with a full disk crashed the API just as surely as
           * one that was unreachable. Same failure, one layer down from the handler above. */
          if (mkdirErr) {
            console.error(`screenshot copy / sftp mkdir error for ${destDir}: `, mkdirErr);
            return done();
          }
          setTimeout(put, 60000);
        });
      } else {
        setTimeout(put, 60000);
      }
    });
  });
};

// The callback is not optional decoration: it is the only signal that the unlink is over and the
// connection can be closed.
module.exports.deleteFile = (filepath) => {
  connection(`delete ${filepath}`, (sftp, done) => {
    sftp.unlink(filepath, (error) => {
      if (error) console.error(`delete / sftp error for ${filepath}: `, error);
      done();
    });
  });
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
 * down did not fail the copy, it killed the API. `connection()` above had the same hole and has
 * since been closed the same way; this still keeps its own connection because it is the only one
 * of the three that has to settle a promise rather than just log.
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
