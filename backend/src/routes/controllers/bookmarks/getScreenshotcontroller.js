const getImage = require("./helpers/getImage.js")

module.exports = async (req, res, _next) => {
  const [screenshotImageString, contentType] = await getImage(req.query.screenshotFilename, req.query.userID);
  res.setHeader('content-type', contentType);
  res.send(screenshotImageString);
  res.status(200);
};
