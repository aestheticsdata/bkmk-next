const { fetchPageTitle } = require("../../../helpers/fetchPageTitle");

/* `GET /bookmarks/page-title?url=…` — what the page at this address calls itself (COS-329).
 *
 * The de-mock of the insert screen's `title` field. The handoff writes `auto-fetched from <title>`
 * under it and nothing fetched anything, so the placeholder was rewritten to say what the field *is*
 * rather than make a promise on every insert (`CREATE_TEXT.fields.titlePlaceholder`). This is the
 * route that lets the promise be made.
 *
 * **It must be the server.** The browser cannot read another origin's `<title>` — that is CORS, and
 * it is the ticket's own reason for asking for a route rather than a `fetch` in a blur handler.
 *
 * ⚠️ **Nothing here is an error the screen has to handle.** A host that does not answer, answers
 * slowly, answers a pdf or answers 403 all come back as `title: null` — the field simply stays empty
 * and gets typed into, which is exactly what it did before this route existed. The only failures that
 * reach the client are the ones from the two middlewares in front: 400 for a url that is not one, 429
 * for a caller asking too often.
 *
 * **A controller this thin is the point.** Everything that is difficult about this route — the
 * scheme, the address ranges, the redirect chain, the ceilings, the charset, the entities — is in
 * `helpers/fetchPageTitle`, where it can be read in one sitting and tested without a request.
 */
module.exports = async (req, res) => {
  const { title } = await fetchPageTitle(req.validated.query.url);
  return res.json({ title });
};
