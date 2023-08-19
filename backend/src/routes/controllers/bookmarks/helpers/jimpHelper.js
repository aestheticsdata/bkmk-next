const {
  access,
  mkdir,
  unlink,
} = require('fs').promises;
const jimp = require('jimp');
const { v1: uuidv1 } = require('uuid');
const { uploadPath } = require("../../../controllers/bookmarks/helpers/constants");
const screenshotsImagesBackup = require("../../../../screenshotsBackup/screenshotsBackup");

const createScreenshot = async ({ file, userID }) => {
  const userDir = uploadPath + userID;
  try {
    await access(userDir);
  } catch (err) {
    await mkdir(uploadPath + userID);
  }

  const fileName = `screenshot--user-${userID}-${uuidv1()}`;
  const extension = file.originalname.split('.').pop();

  const screenshotFromDisk = await jimp.read(file.buffer);
  await screenshotFromDisk.resize(1024, jimp.AUTO);
  await screenshotFromDisk.write(userDir + "/" + fileName + "." + extension);

  if (process.env.NODE_ENV === "production") {
    screenshotsImagesBackup(userDir, fileName + "." + extension, userID);
  }

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


