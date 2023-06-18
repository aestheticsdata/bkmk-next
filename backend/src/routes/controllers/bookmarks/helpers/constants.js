const path = require('path');

module.exports.uploadPath = process.env.NODE_ENV === "production" ?
  process.env.BKMK_SCREENSHOTS_IMAGES_PATH
  :
  path.join(__dirname, "../../../../", "screenshotsUpload/");
