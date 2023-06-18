const dbConnection = require('../../../db/dbinitmysql');
const fs = require("fs");
// const jimp = require('jimp');
// const { uploadPath } = require('../../controllers/bookmarks/helpers/constants');
const jimpHelper = require("./helpers/jimpHelper");

module.exports = async (req, res) => {
  const {
    userID,
    title,
    url,
    categories,
    notes,
    stars,
    priority,
    reminder,
    // screenshot,
    group,
  } = req.body;

  console.log("create bookmark");
  console.log("userID", userID);
  console.log("title", title);
  console.log("req.file", req.file);
  const cat = JSON.parse(categories)
  console.log("cat[0].name", cat[0].name);
  console.log("req.body", req.body);
  // const screenshotFromDisk = await jimp.read(req.file.buffer);
  // await screenshotFromDisk.resize(1024, jimp.AUTO);
  // await screenshotFromDisk.write( uploadPath + req.decoded.id + ".");

  await jimpHelper({
    file: req.file,
    title,
    userID: req.decoded.id,
  });


  res.json("new bookmark added");

  // fs.writeFile("./galaxie.jpg", req.file.buffer, (err) => {
  //   if (err) console.log("error writing file to disk");
  // })
};
