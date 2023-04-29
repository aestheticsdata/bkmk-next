const multer = require('multer');
const {
  access,
  mkdir,
} = require('fs').promises;
const { uploadPath } = require('../../controllers/spendings/helpers/constants');
const { format } = require('date-fns');
const dateFormat = 'yyyy-MM-dd';


const stringToHyphen = s => s.replaceAll(' ', '-');

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const userDir = uploadPath + req.body.userID;

    try {
      await access(userDir);
    } catch (err) {
      await mkdir(uploadPath + req.body.userID);
    } finally {
      cb(null, userDir);
    }
  },
  filename: function (req, file, cb) {
    // could have used req.decode.id from checkToken middlewre for user id
    // but here frontend send userID in req.body
    const {
      itemType,
      date,
      dateFrom,
      label,
    } = req.body;

    let fileName = '';

    switch (itemType) {
      case 'recurring':
        fileName = 'recurring-' + stringToHyphen(label) + '-' + format(new Date(dateFrom), dateFormat);
        break;
      case 'spending':
        fileName = 'spending-' + stringToHyphen(label) + '-' + format(new Date(date), dateFormat);
        break;
      default:
        break;
    }

    cb(null, fileName + '.' + file.originalname.split('.').pop());
  }
});

module.exports = multer({ storage: storage, limits: { fileSize: 32_097_152 } });
