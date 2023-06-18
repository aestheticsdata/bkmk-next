const dbConnection = require('../../../db/dbinitmysql');
const fs = require("fs");

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
  res.json("new bookmark added");

  // fs.writeFile("./galaxie.jpg", req.file.buffer, (err) => {
  //   if (err) console.log("error writing file to disk");
  // })
};
