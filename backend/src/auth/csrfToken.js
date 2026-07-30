/**
 * The double-submit CSRF token (COS-294).
 *
 * Port of `~/dev/pfa/nest-api/src/users/csrf-token.util.ts`, kept function for function so
 * the two projects stay readable side by side. The token lives **in the session**, is
 * echoed to the client in the sign-in response, and the client sends it back in a header:
 * an attacker's page can make the browser send the cookie, but it cannot read the token out
 * of another origin's memory, so it cannot produce the header.
 *
 * Why a token at all when the cookie is already `sameSite: lax`: `lax` blocks the classic
 * cross-site form POST, and the token covers what it does not — a compromised subdomain is
 * same-site, browsers that ignore `SameSite` exist, and Chrome exempts brand-new cookies
 * from the rule for two minutes.
 *
 * **The token never goes to storage**, only into the session on the server and into memory
 * on the client (COS-296). That is the whole point of the exercise: the JWT this lot removes
 * was in `localStorage`.
 */
const { randomBytes, timingSafeEqual } = require("crypto");

const CSRF_TOKEN_SIZE_BYTES = 32;
const SAFE_HTTP_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_HEADER_CANDIDATES = ["x-csrf-token", "x-xsrf-token"];

/**
 * `{}` when the session middleware has not run, so a caller reached out of order reads
 * `undefined` fields instead of throwing.
 */
const getSessionState = (req) => req.session ?? {};

const createCsrfToken = () => randomBytes(CSRF_TOKEN_SIZE_BYTES).toString("hex");

/**
 * Constant-time comparison, because `===` on secrets leaks their prefix through timing.
 * `timingSafeEqual` throws on mismatched lengths, hence the length test first — which is
 * safe to do early: the length of a token is not the secret.
 */
const timingSafeTokenCompare = (expected, received) => {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, receivedBuffer);
};

/** Two names accepted: `x-csrf-token` is ours, `x-xsrf-token` is what axios sends by default. */
const readCsrfHeader = (req) => {
  for (const headerName of CSRF_HEADER_CANDIDATES) {
    const value = req.header(headerName);
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return undefined;
};

const isSafeHttpMethod = (method) => SAFE_HTTP_METHODS.has(method.toUpperCase());

/**
 * The session id is stored as a **string** — see `signInHelper.js` for why — so this test
 * is pfa's, unchanged.
 */
const hasAuthenticatedSession = (req) => typeof getSessionState(req).userId === "string";

/** A new token, replacing any previous one. Called when a session is created. */
const rotateCsrfToken = (req) => {
  const token = createCsrfToken();
  getSessionState(req).csrfToken = token;
  return token;
};

/** The session's token, minted on first ask. Called when the client has lost its copy. */
const getOrCreateCsrfToken = (req) => {
  const session = getSessionState(req);
  if (!session.csrfToken) {
    session.csrfToken = createCsrfToken();
  }
  return session.csrfToken;
};

const clearCsrfToken = (req) => {
  delete getSessionState(req).csrfToken;
};

const hasValidCsrfToken = (req) => {
  const sessionToken = getSessionState(req).csrfToken;
  const headerToken = readCsrfHeader(req);

  if (!sessionToken || !headerToken) {
    return false;
  }

  return timingSafeTokenCompare(sessionToken, headerToken);
};

module.exports = {
  clearCsrfToken,
  getOrCreateCsrfToken,
  hasAuthenticatedSession,
  hasValidCsrfToken,
  isSafeHttpMethod,
  rotateCsrfToken,
};
