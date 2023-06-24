const {
  access,
  mkdir,
} = require('fs').promises;
const jimp = require('jimp');
const { uploadPath } = require("../../../controllers/bookmarks/helpers/constants");

const stringToHyphen = s => s.replaceAll(' ', '-');

module.exports = async ({ file, title, userID }) => {
  console.log("!!!!!!!!! ----- wtf upload path : ", uploadPath);
  console.log("!!!!!! process.env.NODE_ENV", process.env.NODE_ENV);
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
