const { readFile } = require("fs").promises;
const { basename } = require("path");
const { uploadPath } = require("./constants");

module.exports = async (screenshotFilename, userID) => {
  /* `basename` strips any path smuggled into the filename (COS-295). `screenshotFilename` comes
   * from the query string of `GET /bookmarks/upload/:id`, and concatenating it straight into a
   * path let a relative segment escape this directory — the same class of bug as the SQL that
   * ticket parameterises: untrusted input arriving as syntax instead of as a value. The schema
   * now rejects the shape as well; this is the half that holds even if some other caller
   * appears.
   *
   * ⚠️ **`userID` used to come from the query string too**, which made it the caller's choice of
   * *whose* directory to read — a second, larger version of the same escape, and one `basename`
   * could do nothing about. Since COS-322 the controller passes the session's user, so the only
   * thing left travelling from the request is the leaf name. */
  const imageFile = await readFile(uploadPath + userID + "/" + basename(screenshotFilename));
  const base64Image = imageFile.toString("base64");
  const contentType = `image/${screenshotFilename.split(".").pop()}`;
  const screenshotImageString = `data:${contentType};base64,${base64Image}`;

  return [screenshotImageString, contentType];
};
