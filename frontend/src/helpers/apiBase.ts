/* Where the API lives, in one place (COS-296).
 *
 * bkmk is deployed with the front and the API behind the same host, the reverse proxy mapping
 * `/api` onto the Express server. So in production the base is the **relative** `/api`: same
 * origin, no hard-coded domain, and the session cookie travels without CORS being involved at
 * all. That is what replaces the `window.location.host.search("bkmk")` test the old helper
 * used to pick between a literal `https://bkmk.1991computer.com/api/` and localhost.
 *
 * ⚠️ **The prefix is asymmetric, and it has to be.** In development the front is on 3100 and
 * Express is on 3101 with its routes at the root — no `/api` segment exists there, because
 * nothing mounts one; it is the production proxy that adds it. pfa has no such asymmetry, its
 * Nest sets a global `api` prefix in both.
 *
 * The server-side half lives in `auth/server/getServerSession.ts`: it needs an absolute URL
 * and reads it off the incoming request's headers, which cannot be imported from a client
 * component. */

/** The dev override, `http://localhost:3101` in `frontend/.env.local`. */
const DEV_API_BASE = process.env.NEXT_PUBLIC_REMOTE_HOST_FROM_LOCALHOST ?? "";

const PROD_API_BASE = "/api";

const isLocalhost = (): boolean =>
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const getClientApiBase = (): string => (isLocalhost() ? DEV_API_BASE : PROD_API_BASE);

const normalizeUrl = (url: string): string => (url.startsWith("/") ? url : `/${url}`);

/** Absolute in development, relative in production — see the note above. */
const getRequestUrl = (url: string): string => `${getClientApiBase()}${normalizeUrl(url)}`;

export { DEV_API_BASE, getClientApiBase, getRequestUrl, normalizeUrl };
