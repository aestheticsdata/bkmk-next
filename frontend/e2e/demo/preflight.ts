/**
 * Refusing to shoot before there is anything to shoot.
 *
 * Without this the first thing that happens is `demo.setup.ts` reporting
 * `net::ERR_CONNECTION_REFUSED` with a stack pointing into a file about signing
 * in — which says nothing about the actual problem, and sends you looking at
 * credentials. The demo has three preconditions, so it names whichever one is
 * missing instead.
 *
 * Since BMK-73 the run starts the two servers itself when nothing answers on
 * their ports (`webServer` in `playwright.demo.config.ts`, which Playwright runs
 * before this), so the first two checks are a second line: they fire when a
 * server came up on a port other than the one the config expects, or went down
 * between the start and this probe. The third is the one that is still yours.
 */

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3100";

/**
 * The API is a second origin here, not a path under the front.
 *
 * On a laptop the browser client goes straight to Express (`NEXT_PUBLIC_REMOTE_HOST_FROM_LOCALHOST`
 * in `frontend/.env.local`, honoured whenever the page is served from `localhost`); on ks-b nginx
 * puts both halves behind one domain under `/api`. So probing `${BASE_URL}/api` would prove
 * nothing: Next answers there whether the API is up or not.
 *
 * Read from the front's own `.env.local` — `playwright.demo.config.ts` loads it — so that the
 * origin probed here is the one the page is about to talk to, whatever port the API happens to be
 * on. `DEMO_API_URL` overrides it; the last fallback is the port `next.config.js` calls the default.
 */
export const API_URL =
  process.env.DEMO_API_URL ?? process.env.NEXT_PUBLIC_REMOTE_HOST_FROM_LOCALHOST ?? "http://localhost:3101";

async function reachable(url: string): Promise<boolean> {
  try {
    // Any answer at all is enough — a 401 or a redirect still proves something
    // is listening, which is the whole question here.
    await fetch(url, { signal: AbortSignal.timeout(3000), redirect: "manual" });
    return true;
  } catch {
    return false;
  }
}

export default async function preflight(): Promise<void> {
  const problems: string[] = [];

  if (!(await reachable(`${BASE_URL}/login/`))) {
    problems.push(
      `Nothing is listening on ${BASE_URL}.\n` +
        "    The run starts the front itself (`next dev -p 3100`, see webServer in playwright.demo.config.ts)\n" +
        "    and got past that step, so whatever answered has gone. `cd frontend && pnpm dev` runs it by hand;\n" +
        "    the production build works too, on the same port — the API's CORS names that one origin.",
    );
  } else if (!(await reachable(`${API_URL}/users/csrf`))) {
    problems.push(
      `${BASE_URL} answers, but the API does not answer on ${API_URL}.\n` +
        "    That origin is `NEXT_PUBLIC_REMOTE_HOST_FROM_LOCALHOST` in frontend/.env.local — the one the page\n" +
        "    talks to, and the one the run starts the API on (`cd backend && node scripts/dev-api.js` by hand).\n" +
        "    Point DEMO_API_URL at where it listens if it is somewhere else.",
    );
  }

  if (!process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
    problems.push("DEMO_USERNAME and DEMO_PASSWORD are missing from frontend/.env.test.local.");
  }

  if (problems.length > 0) {
    throw new Error(`\n\n  The demo cannot record yet:\n\n  - ${problems.join("\n\n  - ")}\n`);
  }
}
