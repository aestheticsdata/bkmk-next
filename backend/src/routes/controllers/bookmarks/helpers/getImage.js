const { readFile } = require("fs").promises;
const { basename } = require("path");
const { uploadPath } = require("./constants");

module.exports = async (screenshotFilename, userID) => {
  /* `basename` strips any path smuggled into the filename (COS-295). Both arguments come
   * from the query string of `GET /bookmarks/upload/:id`, and concatenating them meant
   * `?screenshotFilename=../../../etc/passwd` read whatever the process could — the same
   * class of bug as the SQL this ticket parameterises: untrusted input arriving as syntax
   * instead of as a value. The schema now rejects the shape as well; this is the half that
   * holds even if some other caller appears. */
  const imageFile = await readFile(uploadPath + userID + "/" + basename(screenshotFilename));
  const base64Image = imageFile.toString("base64");
  const contentType = `image/${screenshotFilename.split(".").pop()}`;
  const screenshotImageString = `data:${contentType};base64,${base64Image}`;

  return [screenshotImageString, contentType];
};
