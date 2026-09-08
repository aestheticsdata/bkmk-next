import { existsSync } from "node:fs";
import { join } from "node:path";
import { API_URL } from "@e2e/demo/preflight";
import { defineConfig, devices } from "@playwright/test";

/**
 * The portfolio demo run — a filming job, not a test one. bkmk has no E2E suite beside it; if one
 * arrives it gets its own `playwright.config.ts`, and this one never runs a spec.
 *
 * One worker, no retries (half a retried take is worse than no take), a long timeout because the
 * run deliberately spends most of its time waiting, and video at the exact viewport size, so no
 * scaling ever touches the picture.
 *
 * No `storageState`: the take films the sign-in itself, so the demo project starts every run from
 * a cold browser. The setup project only puts the account back the way the take expects to find it.
 */
/** Where the front answers. The take opens `/login/` on it. */
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3100";

/* Node's own loader rather than `dotenv`, which nothing else in this front depends on. Two files:
 * `.env.local` for the API origin the page talks to (`NEXT_PUBLIC_REMOTE_HOST_FROM_LOCALHOST`, read
 * by preflight and the setup project), `.env.test.local` for the demo credentials. A variable
 * already in the environment wins over either file, which is what lets `DEMO_API_URL=… pnpm
 * video:generate` override the first. */
for (const file of [".env.local", ".env.test.local"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

/** 1080p by default: native, 16:9, and nothing upscales on the way to a landing page. */
const viewport = {
  width: Number(process.env.DEMO_WIDTH ?? 1920),
  height: Number(process.env.DEMO_HEIGHT ?? 1080),
};

/**
 * Renders at twice the resolution and lets the encoder downsample into the same
 * frame. Supersampling: visibly crisper text, for CPU. It is the default
 * because `pnpm video:generate` should produce the best picture it can without
 * being asked — `DEMO_SCALE=1` is the way out if a slow machine drops frames.
 */
const deviceScaleFactor = Number(process.env.DEMO_SCALE ?? 2);

const chrome = {
  ...devices["Desktop Chrome"],
  viewport,
  deviceScaleFactor,
  // The app formats every date in the browser (`date-fns`, `yyyy-MM-dd`) and the alarms screen's
  // clock is the browser's: the browser is pinned to what the film expects rather than to whatever
  // the machine running it happens to be set to.
  locale: "fr-FR",
  timezoneId: "Europe/Paris",
  launchOptions: {
    headless: process.env.DEMO_HEADED !== "1",
    args: ["--force-color-profile=srgb", "--hide-scrollbars"],
  },
};

export default defineConfig({
  testDir: "./e2e/demo",
  // Checks the app is actually up before a browser is launched, so a shut-down
  // server is reported as a shut-down server rather than as a login failure.
  globalSetup: "./e2e/demo/preflight.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 8 * 60_000,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "off",
    // Off unless asked for: the CDP recorder in `e2e/demo/recorder.ts` captures
    // the same screencast without the 25fps ceiling, and running both at once
    // would have two clients acking the same frames.
    video: process.env.DEMO_RECORDER === "playwright" ? { mode: "on" as const, size: viewport } : ("off" as const),
  },
  /* The two halves of the app, started by the run when nothing answers on their ports and left
   * alone when something does (`reuseExistingServer`) — a `pnpm dev` of yours, or the pm2
   * `bkmk-server`, is filmed as it is. Playwright starts these before `globalSetup`, so `preflight`
   * only ever sees them up; what it still checks is the credentials.
   *
   * The API goes through `backend/scripts/dev-api.js` rather than pm2: Playwright needs a process
   * that stays attached, and `pm2 start` returns at once. The front is `next dev` on its usual port
   * — the dev overlays are painted out by the take — without the `--inspect` the `dev` script adds,
   * which would collide with any other inspected node on the machine.
   *
   * `/users/csrf` answers 401 without a session, which is one of the statuses Playwright accepts
   * as "ready"; `/login/` answers 200. Two minutes for the front: a cold `next dev` compiles the
   * login route on the first request, and a first request that took ninety seconds was measured. */
  webServer: [
    {
      command: "node scripts/dev-api.js",
      cwd: join(__dirname, "..", "backend"),
      url: `${API_URL}/users/csrf`,
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: "pnpm exec next dev -p 3100",
      cwd: __dirname,
      url: `${BASE_URL}/login/`,
      reuseExistingServer: true,
      timeout: 120_000,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
  projects: [
    { name: "setup", testMatch: /demo\.setup\.ts/, use: chrome },
    {
      name: "demo",
      testMatch: /.*\.demo\.ts/,
      dependencies: ["setup"],
      use: chrome,
    },
  ],
});
