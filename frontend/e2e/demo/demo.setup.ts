import { API_URL } from "@e2e/demo/preflight";
import { expect, test as setup } from "@playwright/test";

/**
 * Putting the account back the way the take expects to find it.
 *
 * The take signs in on camera, so this project saves no session for it. What it does is undo the
 * one thing a previous take could leave behind that the next one would trip on: an alarm still
 * asleep. The alarms chapter snoozes one and resumes it, and a take that stopped between the two —
 * a crash, a Ctrl-C — leaves it paused; the next take then looks for a running alarm to snooze and
 * may pick a shorter list than it expected. `PATCH /reminders { paused: false }` wakes every alarm
 * of the account in one statement, which is also the screen's own `resume all`.
 *
 * bkmk has no language and no theme on the account, so there is nothing else to put back. What
 * the take *adds* — a record, an imported batch, an edited record — stays: the reset for that is
 * the seeder (`backend/docs/seeding.md`), and the README says when to run it.
 *
 * Through the API rather than the database: the same call the command bar makes, on the same
 * guard. The house dev account, never anything real — the film is for a public page.
 *
 * ⚠️ bkmk keeps ONE live session per account: every sign-in — this one, then the take's own —
 * revokes the others (`backend/src/routes/controllers/users/helpers/signInHelper.js`). Your own
 * tab on `local.dev@mock.io` is signed out the moment a take starts, and a sign-in of yours
 * mid-take 401s every request the film makes.
 */
setup("wake every alarm of the dev account", async ({ request }) => {
  const username = process.env.DEMO_USERNAME;
  const password = process.env.DEMO_PASSWORD;
  setup.skip(!username || !password, "set DEMO_USERNAME and DEMO_PASSWORD in .env.test.local");

  // Sign-in needs no CSRF token; it hands one back, and the session cookie it sets rides on
  // this request context for the call that follows.
  const signIn = await request.post(`${API_URL}/users`, { data: { email: username, password } });
  expect(signIn.ok(), `sign-in as ${username} answered ${signIn.status()} — check .env.test.local`).toBeTruthy();
  const { csrfToken } = (await signIn.json()) as { csrfToken: string };

  const patch = await request.patch(`${API_URL}/reminders`, {
    data: { paused: false },
    headers: { "x-csrf-token": csrfToken },
  });
  expect(patch.ok(), `PATCH /reminders answered ${patch.status()}`).toBeTruthy();
});
