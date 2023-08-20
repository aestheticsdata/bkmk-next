const { readFile } = require('fs').promises;
const { uploadPath } = require('./constants');


module.exports = async (screenshotFilename, userID) => {
  const imageFile = await readFile(uploadPath + userID + '/' + screenshotFilename);
  const base64Image = imageFile.toString('base64');
  const contentType = `image/${screenshotFilename.split('.').pop()}`;
  const screenshotImageString = `data:${contentType};base64,${base64Image}`;

  return [screenshotImageString, contentType];
}
