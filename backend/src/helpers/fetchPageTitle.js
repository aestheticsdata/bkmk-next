const { lookup } = require("node:dns").promises;
const net = require("node:net");

/* One outbound fetch of a page the user is about to bookmark, and its title (COS-329).
 *
 * The insert screen's `title` field was filled by hand, and the handoff writes `auto-fetched from
 * <title>` under it. This is what makes that sentence true.
 *
 * **It has to be the server.** A browser cannot read another origin's `<title>`; that is CORS, and it
 * is the reason the ticket asks for a `GET` rather than a `fetch` in the field's blur handler.
 *
 * ⚠️ **The favicon was folded into this ticket, built on top of this fetcher, and then removed on the
 * owner's call.** If it is ever reopened, this is the file it belongs in, and the reason for putting
 * it here is unchanged: the `<head>` read below is the one that names the icon, so a second fetcher
 * would mean a second timeout, a second address guard and a second idea of what an icon is.
 *
 * What killed it was a measurement, and it is written here so nobody reproposes it without one. The
 * ticket argues that a 16px favicon per row is "the strongest scanning aid available on a 22-row mono
 * table". Counted on the real index — 1 331 records, 1 241 with a host, **160 distinct hosts** —
 * `youtube.com` is **963 of them, 78 %**. The column would draw the same mark on roughly 17 lines out
 * of 22. That number reads both ways (a uniform field makes the exception pop), which is why it was
 * put to the owner rather than decided here; the call was to drop it. What it cost to build, for
 * whoever picks it up: a host-keyed store and table, an ICO container decoder — four of ten measured
 * hosts serve a bare PNG under `image/x-icon`, four serve 32bpp DIB-in-ICO at 5–17 KB against ~700 B
 * decoded — a 160-host backfill, and a favicons map on every index response.
 *
 * ⚠️ **This is the only route in bkmk where the server fetches an address the caller chose**, which
 * is a different thing from every other controller here and is guarded as one:
 *
 * - **`http` and `https` only.** `file:`, `ftp:` and friends are not pages and are not fetched.
 * - **The address is resolved and checked before each request**, not just the first: a public host is
 *   free to answer `302 http://127.0.0.1:6379/`, so redirects are followed by hand — at most three —
 *   and every hop goes through the same check. Loopback, private, link-local (which is where cloud
 *   metadata lives), CGNAT and multicast are all refused.
 * - **Five seconds, and a megabyte** — and the reading stops at `</head>` whichever comes first, so
 *   an ordinary page costs one chunk. Both bounds exist so that a host that answers slowly, or
 *   forever, costs one request slot and not a worker.
 *
 * ⚠️ **The check is on the addresses DNS returns, and `fetch` resolves the name again** — so a name
 * that answers publicly here and privately a millisecond later is not caught. Closing that means
 * connecting to a pinned address and carrying the `Host` header by hand, which is a different piece
 * of code from this one. It is written down rather than glossed: this route is behind a session, on a
 * self-hosted single-account product, and the bound above is the proportionate one.
 */

const TIMEOUT_MS = 5_000;

/* ⚠️ **A megabyte, and it was 256 KB until the index it serves was measured against.** YouTube is 963
 * of the 1 331 records here, and a watch page's `<title>` sits at byte **685 990** — 696 KB of inline
 * configuration ahead of it, and `</head>` right behind. At the old ceiling the one host that matters
 * most on this index came back with no title at all. The reading stops at `</head>` anyway, so an
 * ordinary page still costs a chunk or two; this is the ceiling for the pages that are not ordinary. */
const MAX_BYTES = 1024 * 1024;

const MAX_REDIRECTS = 3;

/** Says what it is and where it comes from. A blank agent is what a lot of hosts answer 403 to, and
 *  a borrowed browser string would be a lie told to every site the user bookmarks. */
const USER_AGENT = "bkmk/1.0 (+https://github.com/aestheticsdata/bkmk-next; fetches page titles)";

/* Addresses that are not "somewhere on the internet".
 *
 * `169.254.0.0/16` is the one worth naming: it is where every cloud provider parks its instance
 * metadata, so it is the address an SSRF is usually aimed at. The rest are the ranges a self-hosted
 * box has behind it — a database, a Redis, a router's admin page. */
const isPrivateAddress = (address) => {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 224+ is multicast and reserved; nothing there serves a web page.
    return a >= 224;
  }

  const ip = address.toLowerCase();
  if (ip === "::" || ip === "::1") return true;
  // `fc00::/7` unique-local, and `fe80::/10` link-local — which is `fe80` through `febf`.
  if (/^f[cd]/.test(ip) || /^fe[89ab]/.test(ip)) return true;
  // `::ffff:127.0.0.1` is loopback wearing an IPv6 hat.
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? isPrivateAddress(mapped[1]) : false;
};

/** Every address the name answers with has to be public — `all: true` rather than the first one,
 *  because a name that resolves to one public and one loopback address is not half-safe. A literal
 *  address in the url never reaches DNS and is checked directly. */
const resolvesPublicly = async (hostname) => {
  if (net.isIP(hostname)) return !isPrivateAddress(hostname);

  try {
    const addresses = await lookup(hostname, { all: true });
    return addresses.length > 0 && addresses.every(({ address }) => !isPrivateAddress(address));
  } catch {
    // A name that does not resolve is not a page. Same answer as a refused one, from here.
    return false;
  }
};

/** The url if it is one this fetches, `null` otherwise. Mirrors `normaliseUrl`'s own `readable`:
 *  the scheme is checked rather than the parse, because `URL` reads `chrome://flags` happily. */
const readable = (raw) => {
  try {
    const url = new URL(String(raw).trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

/* The document down to `</head>`, or to the ceiling, decoded.
 *
 * Read through the stream rather than `response.text()`, and for two reasons. The point of a cap is
 * not to hold a 40 MB page in memory before deciding it was too big — and everything this reads is in
 * the head, so the moment `</head>` goes past there is nothing left to wait for. The reader is
 * cancelled either way, which is what closes the socket on a host still sending.
 *
 * **The marker is looked for in the bytes, not in the decoded text**, so that the search costs one
 * pass per chunk instead of a re-decode of everything received so far. `latin1` is byte-for-byte, so
 * an ASCII tag reads the same out of it whatever the page's real encoding turns out to be. `carry`
 * holds the tail of the previous chunk: `</head>` split across a packet boundary is otherwise a
 * marker that is never found.
 *
 * **Charset comes from the header first, then from the document.** A `<meta charset>` is checked
 * because plenty of pages declare nothing in their `Content-Type`, and a French title read as utf-8
 * out of a `windows-1252` page comes back full of replacement characters. Decoding twice costs one
 * extra pass, and only when the declared charset is not utf-8. */
const readHead = async (response) => {
  const reader = response.body?.getReader();
  if (!reader) return "";

  const chunks = [];
  let size = 0;
  let carry = "";
  let complete = false;

  try {
    while (size < MAX_BYTES && !complete) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = Buffer.from(value);
      chunks.push(chunk);
      size += chunk.length;

      const text = carry + chunk.toString("latin1");
      complete = /<\/head/i.test(text);
      // Six characters is `</head` less one, which is the most of it a boundary can hide.
      carry = text.slice(-6);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }

  const bytes = Buffer.concat(chunks).subarray(0, MAX_BYTES);
  const declared = /charset=["']?([\w-]+)/i.exec(response.headers.get("content-type") ?? "")?.[1];

  const decode = (charset) => {
    try {
      return new TextDecoder(charset).decode(bytes);
    } catch {
      return null;
    }
  };

  const first = (declared && decode(declared)) ?? decode("utf-8") ?? "";
  if (declared) return first;

  const inDocument = /<meta[^>]+charset=["']?([\w-]+)/i.exec(first)?.[1];
  if (!inDocument || /^utf-?8$/i.test(inDocument)) return first;
  return decode(inDocument) ?? first;
};

/** The named entities a `<title>` actually carries, plus the numeric forms. Not a full table: this
 *  is a page title, not a document body, and `&amp;` `&#39;` and `&nbsp;` are what shows up in one. */
const ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  ldquo: "“",
  rdquo: "”",
};

const decodeEntities = (text) =>
  text.replace(/&(#x?[0-9a-f]+|\w+);/gi, (whole, body) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body.toLowerCase()] ?? whole;
  });

/** Whitespace in markup is not whitespace on screen: a `<title>` split across three indented lines is
 *  one line in the tab. */
const collapse = (text) => decodeEntities(text).replace(/\s+/g, " ").trim();

/** The attributes of one tag, lower-cased names, decoded values. Quoted and bare forms both, because
 *  `<link rel=icon href=/favicon.png>` is valid and common. */
const attributesOf = (tag) => {
  const attributes = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
};

/* Reading the head with regular expressions rather than a parser, and the reason is the size of the
 * alternative: bkmk has no HTML parser and adding `cheerio` — with its `parse5`, its `css-select` and
 * their trees — to read two tags is a dependency out of proportion to the job.
 *
 * What that costs is written down: a `<title>` inside a comment or a `<script>` string would be read
 * as the page's own. The scan is cut at `</head>` to keep that to the head, where a stray `<title>`
 * is vanishingly rare, and a wrong title is a field the user retypes — not a failure that reaches
 * anything else. */
const headOf = (html) => {
  const end = html.search(/<\/head\s*>/i);
  return end === -1 ? html : html.slice(0, end);
};

/** `<title>` first, `og:title` in fallback — the ticket's order, and the right one: `og:title` is
 *  written for a link preview and is often the site's name where the `<title>` is the article's. */
const titleFrom = (head) => {
  const inTitle = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1];
  if (inTitle && collapse(inTitle) !== "") return collapse(inTitle);

  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = attributesOf(tag);
    // `property` is the Open Graph spelling; `name` is what several CMSs emit instead.
    if (attributes.property === "og:title" || attributes.name === "og:title") {
      const content = collapse(attributes.content ?? "");
      if (content !== "") return content;
    }
  }

  return null;
};

/* One request, its redirects followed by hand.
 *
 * `redirect: "manual"` is the whole point — `fetch` would follow them itself, and the address it
 * landed on would never be checked. Each hop goes back through `resolvesPublicly`.
 *
 * The signal is per-attempt rather than for the chain: three hops of five seconds is a worst case of
 * fifteen, which is the shape of a limit that exists so nothing hangs forever, not a latency budget.
 */
const fetchFollowing = async (url) => {
  let current = url;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!(await resolvesPublicly(current.hostname))) return null;

    const response = await fetch(current.href, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
    });

    if (response.status < 300 || response.status > 399) return { response, url: current };

    const location = response.headers.get("location");
    await response.body?.cancel().catch(() => {});
    if (!location) return null;

    const next = readable(new URL(location, current).href);
    if (!next) return null;
    current = next;
  }

  return null;
};

/* `{ title }` for a url, and `{ title: null }` for anything that could not be read.
 *
 * **Nothing here throws**, and that is the contract the controller is written against: this is
 * an assist on a form, so "the host did not answer" and "the host answered rubbish" are the same
 * answer to the screen — the field stays empty and the user types. A rejected promise would turn
 * every unreachable link into a 500 under a form that is otherwise fine.
 *
 * ⚠️ **A refusal is `null`, never the page it was refused with**, and that distinction was measured:
 * `stackoverflow.com` and `etsy.com` both answer **403** to this fetcher — Cloudflare — with a body
 * whose `<title>` reads `Just a moment...`. Reading a title out of a non-`ok` response would have
 * filled those records with that string, which is worse than the empty field it replaced. */
const fetchPageTitle = async (raw) => {
  const nothing = { title: null };

  const url = readable(raw);
  if (!url) return nothing;

  try {
    const landed = await fetchFollowing(url);
    if (!landed?.response.ok) {
      await landed?.response.body?.cancel().catch(() => {});
      return nothing;
    }

    const type = landed.response.headers.get("content-type") ?? "";
    if (type !== "" && !/html|xml/i.test(type)) {
      await landed.response.body?.cancel().catch(() => {});
      // A pdf or an image has no head to read, and it is a perfectly ordinary thing to bookmark.
      return nothing;
    }

    return { title: titleFrom(headOf(await readHead(landed.response))) };
  } catch {
    // The host did not answer at all — a timeout, a reset, a name that stopped resolving mid-chain.
    return nothing;
  }
};

module.exports = { fetchPageTitle, isPrivateAddress, resolvesPublicly, MAX_BYTES, TIMEOUT_MS, USER_AGENT };
