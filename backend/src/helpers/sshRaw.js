const ssh = require("ssh2");
const fs = require("fs");

const config = {
  host: process.env.BKMK_BACKUP_SERVER_IP,
  port: 22,
  username: process.env.DEBIAN_OVH_VPS_SSH_USER,
  // password: process.env.DEBIAN_OVH_VPS_SSH_PASSWORD,
  privateKey: process.env.NODE_ENV === "production" && fs.readFileSync(process.env.DEBIAN_OVH_VPS_SSH_KEY_PATH),
};

const connection = fn => {
  const conn = new ssh.Client();
  conn.on('ready', fn(conn)).connect(config);
}

module.exports.copy = (src, destDir, filename) => {
  const copy = conn => () => conn.sftp((err, sftp) => {
    // when sending pics from phone, copied image is 0 byte
    // adding a 1-minute timeout fixes the issue
    sftp.readdir(destDir, (err) => {
      if (err) {
        // créer le répertoire avec l'ID du user
        sftp.mkdir(destDir, (mkdirErr) => {
          if (mkdirErr) throw mkdirErr;
          setTimeout(() => {
            sftp.fastPut(src, destDir+"/"+filename, {}, error => { console.log("sftp error: ", error) });
          }, 60000);
        });
      } else {
        setTimeout(() => {
          sftp.fastPut(src, destDir+"/"+filename, {}, error => { console.log("sftp error: ", error) });
        }, 60000);
      }
    })
  });
  connection(copy);
};

module.exports.deleteFile = filepath => {
  const deleteFile = conn => () => conn.sftp((err, sftp) => {
    sftp.unlink(filepath);
  });
  connection(deleteFile);
};
