const {
  access,
  mkdir,
  unlink,
} = require('fs').promises;
const jimp = require('jimp');
const { uploadPath } = require("../../../controllers/bookmarks/helpers/constants");

const stringToHyphen = s => s.replaceAll(' ', '-');

const createScreenshot = async ({ file, title, userID }) => {
  const userDir = uploadPath + userID;
  try {
    await access(userDir);
  } catch (err) {
    await mkdir(uploadPath + userID);
  }

  const fileName = `screenshot-${stringToHyphen(title)}`;
  const extension = file.originalname.split('.').pop();

  const screenshotFromDisk = await jimp.read(file.buffer);
  await screenshotFromDisk.resize(1024, jimp.AUTO);
  await screenshotFromDisk.write(userDir + "/" + fileName + "." + extension);

  return `${fileName}.${extension}`;
}

const deleteScreenshot = async ({ filename, userID }) => {
  const userDir = uploadPath + userID;
  try {
    await unlink(userDir + "/" + filename);
  } catch (e) {
    throw e;
  }
}

module.exports = {
  createScreenshot,
  deleteScreenshot,
}


