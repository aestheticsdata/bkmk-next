const multer = require('multer');
const {
  access,
  mkdir,
} = require('fs').promises;
const { uploadPath } = require('../../controllers/bookmarks/helpers/constants');


const stringToHyphen = s => s.replaceAll(' ', '-');

const storage = multer.diskStorage({
  // req.decode.id from checkToken middlewre for user id
  destination: async function (req, file, cb) {
    const userDir = uploadPath + req.decoded.id;

    try {
      await access(userDir);
    } catch (err) {
      await mkdir(uploadPath + req.decoded.id);
    } finally {
      cb(null, userDir);
    }
  },
  filename: function (req, file, cb) {
    const fileName = `screenshot-${stringToHyphen(req.body.title)}`;
    cb(null, fileName + '.' + file.originalname.split('.').pop());
  }
});

module.exports = multer({ storage: storage, limits: { fileSize: 32_097_152 } });
