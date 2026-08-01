/* One definition of "the same url", and one of "host" (COS-338).
 *
 * `url.original` had no normal form. Every write path inserted a fresh row unconditionally, so
 * `https://x.com/a`, `http://x.com/a/` and `https://x.com/a?utm_source=rss` were three rows and three
 * different bookmarks — and the import's duplicate check, which had nothing else to compare, said as
 * much (`markImportDuplicates` carried that limit in its header, naming this ticket).
 *
 * **The original is never touched.** It is what the record shows and what the `↗` opens; a link is
 * the thing the site actually served, tracking parameters and all. The normal form is a *key* — the
 * string two urls are compared on — and it is stored beside the original rather than computed at
 * query time, so that the comparison can be an index instead of 1 280 `URL` parses per question.
 *
 * ⚠️ **It is a key, not a url.** The scheme is dropped, so it does not parse and must never be
 * rendered or fetched. Dropping it is what makes the ticket's own example work: `http://x.com/a/` and
 * `https://x.com/a` are the same page, and every serious host has answered both for a decade. A
 * scheme that is not `http`/`https` keeps everything, since `view-source:` and `chrome://` are not
 * addresses of the same kind and there is nothing to compare them with.
 *
 * ⚠️ **What it merges on the real index, measured, is one pair** — `react-select.com/home` and the
 * same address with `#fixed-options`. That is not the argument for it. The argument is the 1 075 rows
 * of 1 237 that carry `www.`, the 57 with a trailing slash and the 5 with tracking parameters: today
 * every one of those is a duplicate waiting to be created by the next import, and COS-307 and COS-308
 * have had no definition to ask. The index also holds 38 rows that are *exactly* equal already, which
 * is the other half of the same story.
 */

/** Parameters a link carries for whoever sent it, not for the page it opens. `utm_*` covers the
 *  family by prefix; the rest are the per-network ones that do not share it. Cutting them is what
 *  makes the same article shared twice one row. */
const TRACKING_PARAMS = new Set([
  "fbclid",
  "gclid",
  "dclid",
  "msclkid",
  "yclid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "_ga",
  "_gl",
]);

const isTracking = (name) => name.startsWith("utm_") || TRACKING_PARAMS.has(name);

/** The address, if it is one of the kind this normalises. `URL` reads `view-source:…` and
 *  `chrome://flags` happily and answers an empty or nonsense host for them, so the scheme is checked
 *  rather than the parse. */
const readable = (raw) => {
  try {
    const url = new URL(String(raw).trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

/** `www.` is a prefix on a name, not a name — except when it is the whole one. `www.com` is a
 *  registered domain, and stripping the label off it would file it under `com`. */
const withoutWww = (host) => {
  const stripped = host.replace(/^www\./, "");
  return stripped.includes(".") ? stripped : host;
};

/* The query, minus the tracking parameters, **kept in the encoding the original used**.
 *
 * `URLSearchParams.toString()` was the short way to write this and it is the wrong one: it re-encodes
 * as it re-serialises, and a `~` comes back as `%7E` — three characters where there was one. The
 * normal form goes in a `VARCHAR(2048)` beside an original that is itself capped at 2048, so a
 * transformation allowed to *grow* a string is a save that answers 500 on a long enough url. Cutting
 * pairs out of `search` only ever shortens it, which is what makes the column safe without a clamp.
 *
 * Order is left alone. Sorting the pairs was measured against the index and merges nothing: parameter
 * order comes from the site's own links, so it is already stable. */
const queryWithoutTracking = (search) =>
  search
    .slice(1)
    .split("&")
    .filter((pair) => pair !== "" && !isTracking(pair.split("=")[0].toLowerCase()))
    .join("&");

/** The host a record is filed under: lower-cased by `URL`, without `www.`, with the port when it is
 *  not the scheme's default. `null` for anything that is not an http address — the rail's `host` axis
 *  (COS-339) is about web hosts, and `flags` read off `chrome://flags` would be a category invented
 *  from a scheme. */
const hostOf = (raw) => {
  const url = readable(raw);
  return url ? withoutWww(url.host) : null;
};

/** `{ normalised, host }` for a url as it was typed or imported — both `null` when there is no url at
 *  all, which is a column that holds `NULL` and a row that does not exist.
 *
 *  A string `URL` cannot read is its own key, trimmed: an index holds `I won't do it again` and
 *  `qwpkqwpkqxpk`, and comparing those as exact strings is the only honest thing to do with them. */
const normaliseUrl = (raw) => {
  if (raw === null || raw === undefined) return { normalised: null, host: null };

  const trimmed = String(raw).trim();
  if (trimmed === "") return { normalised: null, host: null };

  const url = readable(trimmed);
  if (!url) return { normalised: trimmed, host: null };

  const host = withoutWww(url.host);
  // A trailing slash is not a different page, and `/` on its own is the site's own root.
  const path = url.pathname.replace(/\/+$/, "");
  const query = queryWithoutTracking(url.search);

  return { normalised: host + path + (query === "" ? "" : `?${query}`), host };
};

module.exports = { normaliseUrl, hostOf };
