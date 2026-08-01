const getImage = require("./helpers/getImage.js");

/* ⚠️ **The directory is the session's, not the query string's** (COS-322), and on this route the
 * client's `?userID=` was not selecting rows but naming a **folder on disk**: screenshots live under
 * `uploadPath/<userID>/`, so the parameter chose whose files to read. COS-295 had already stopped a
 * filename from escaping that folder with `basename`; what it left standing was the caller picking
 * which folder to stand in. Reading the id off the session closes the last half of that path.
 *
 * The record id in `/bookmarks/upload/:id` is still not consulted — the filename alone identifies the
 * file, and a user reaching their own screenshots by name inside their own folder is the feature.
 * Pairing filename to record would be a stricter check with nothing left to catch.
 *
 * The parameter itself left the wire with COS-306, which is why `screenshotQuerySchema` is down to the
 * filename. Nothing here changed with it: this line already read the session. */
module.exports = async (req, res, _next) => {
  const [screenshotImageString, contentType] = await getImage(req.validated.query.screenshotFilename, req.user.id);
  res.setHeader("content-type", contentType);
  res.send(screenshotImageString);
  res.status(200);
};
