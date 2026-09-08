import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@e2e/demo/fixture";
import { ALARMS_TEXT } from "@text/alarms";
import { INDEX_TEXT } from "@text/index";

import type { BrowserContext, Locator, Page } from "@playwright/test";

/**
 * bkmk, end to end — one continuous take, nine chapters, six screens.
 *
 * This file is the storyboard and nothing else: no pointer paths, no video, no timing arithmetic.
 * Those live in `cursor.ts`, `fixture.ts` and `pacing.ts`, so what is left here reads as a shot
 * list and can be reordered by moving blocks around.
 *
 * Four things it never breaks.
 *
 * IT SIGNS IN ON CAMERA. The film opens on the login form and types the house dev account into
 * it — there is no saved session, the browser is cold on every take. `demo.setup.ts` only wakes the
 * account's alarms beforehand, because the alarms chapter snoozes one and a take that stopped
 * halfway would leave it asleep.
 *
 * IT ADDRESSES MARKS, NOT WORDS. Every element it touches carries a `data-testid` (BMK-73, the same
 * contract as the other five harnesses), and wherever a choice depends on data the mark carries the
 * datum beside it — `data-count` on the rail, `data-has-shot` on a row, `data-paused` on an alarm —
 * so the storyboard reads a fact and never a label. The copy modules (`@text`) are read only to
 * check what a menu or a cell says.
 *
 * IT WRITES, INTO THE SEEDED ACCOUNT ONLY. A record, an imported batch, an edited record: three
 * writes, all on `local.dev@mock.io`, and the seeder is what puts the rest around them
 * (`backend/docs/seeding.md`). Nothing is deleted — `delete` sits beside `edit` on every row and
 * every screen here, so rows are hovered near their text and the one thing snoozed is resumed.
 *
 * NOTHING ON SCREEN IS REAL. The account is the house one, the index is the seeder's invented
 * one, and the two files the take uploads — a screenshot and an export — are drawn by this file
 * before the first frame.
 */

const USERNAME = process.env.DEMO_USERNAME ?? "";
const PASSWORD = process.env.DEMO_PASSWORD ?? "";

/** The files the take uploads: drawn here, beside the film, gitignored with the rest of `out/`. */
const UPLOAD_DIR = join(__dirname, "out", "upload");
const SHOT = join(UPLOAD_DIR, "page.png");
const IMPORT_FILE = join(UPLOAD_DIR, "bookmarks.csv");

/** What the take inserts. Invented; its url is the one read off the record chapter opens, which is
 *  what makes the duplicates panel count. */
const NEW_RECORD = { title: "Keeping a tidy index: the follow-up" };

/** The half of the import file the index does not hold yet. A host the seeder never uses, so every
 *  one of these stages as `new` whatever the account already holds. */
const NEW_LINKS = [
  ["A reading log for the autumn", "https://inbox.example/reading/a-reading-log-for-the-autumn"],
  ["Tide tables for the harbour town", "https://inbox.example/lab/tide-tables-for-the-harbour-town"],
  ["Field recordings from the canal", "https://inbox.example/music/field-recordings-from-the-canal"],
  ["Brown butter, one more time", "https://inbox.example/recipes/brown-butter-one-more-time"],
  ["Offline maps, revisited", "https://inbox.example/travel/offline-maps-revisited"],
];

/**
 * A page that does not exist, photographed at the context's scale: a dark address bar, the title in
 * large type, grey bars where the paragraphs would be. The API resizes it to 1024 wide on the way in.
 */
async function drawPage(context: BrowserContext, title: string, host: string): Promise<void> {
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const sheet = await context.newPage();
  await sheet.setViewportSize({ width: 1280, height: 800 });
  const bars = [880, 840, 900, 620, 0, 860, 790, 880, 540, 0, 900, 700]
    .map((width) => `<div style="height:14px;margin-bottom:18px;width:${width}px;background:#cfcac0"></div>`)
    .join("");
  await sheet.setContent(`
    <body style="margin:0;background:#f3f1ea;font-family:Helvetica,Arial,sans-serif">
      <div style="height:64px;background:#2a2d31;display:flex;align-items:center;padding:0 160px">
        <div style="flex:1;max-width:940px;height:32px;line-height:32px;padding:0 16px;border-radius:5px;
                    background:#3d4147;color:#d7d9dc;font-size:16px">${host}</div>
      </div>
      <h1 style="margin:96px 80px 0;font-size:44px;font-weight:600;color:#1f1f1f">${title}</h1>
      <div style="margin:72px 80px 0">${bars}</div>
    </body>`);
  await sheet.screenshot({ path: SHOT });
  await sheet.close();
}

/** The still's copy of the import file: the same shape, other links. The take commits the first
 *  file, so by the time the stills are taken every line of it is a `dup`; these are never sent, so
 *  they stage as `new` on every run. */
const IMPORT_STILL_FILE = join(UPLOAD_DIR, "bookmarks-still.csv");

/** `title;url` per line — the csv shape the import screen's right pane documents. Half of the links
 *  are read off the index during the take, so the staged table shows both states. */
function writeImportFiles(existing: { title: string; url: string }[]): void {
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const held = existing.map(({ title, url }) => [title, url]);
  const csv = (lines: string[][]) => `${lines.map(([title, url]) => `${title};${url}`).join("\n")}\n`;
  writeFileSync(IMPORT_FILE, csv([...NEW_LINKS, ...held]), "utf8");
  const later = NEW_LINKS.map(([title, url]) => [`${title}, part two`, `${url}-part-two`]);
  writeFileSync(IMPORT_STILL_FILE, csv([...later, ...held]), "utf8");
}

test("bkmk, end to end", async ({ demo }) => {
  const page = demo.page;

  const tab = (name: string) => page.locator(`[data-testid="nav-tab"][data-tab="${name}"]`);
  const rows = page.getByTestId("index-row");
  /** The bubble the row's tags cell answers a hover with (`ds/CursorTooltip`): unmounted when nothing
   *  is hovered, so asserting it is asserting the hover landed. */
  const bubble = page.getByTestId("cursor-tooltip");

  /** Walk the pointer along a family of marks, pausing on each. Positional: the count is structural. */
  const sweep = async (marks: Locator, positions: number[], hold: number, aim?: "text") => {
    const count = await marks.count();
    for (const index of positions) {
      if (index < count) await demo.moveTo(marks.nth(index), { dwell: hold, aim });
    }
  };

  /**
   * The rail row with the most records — read off `data-count`, never the first row. The rail is
   * alphabetical, so "the first" would be whichever name sorts lowest.
   */
  const busiestCategory = async (target: Page): Promise<Locator> => {
    const categories = target.getByTestId("rail-category");
    await expect(categories.first()).toBeVisible();
    const counts = await categories.evaluateAll((nodes) =>
      nodes.map((node) => Number(node.getAttribute("data-count") ?? 0)),
    );
    return categories.nth(counts.indexOf(Math.max(...counts)));
  };

  /**
   * The record the film opens: the richest row on the page — a screenshot, a note and an alarm when
   * one has all three, then the best the page offers. Read off the rows' attributes, so the choice
   * survives a reseed and an index that is not the seeder's.
   */
  const richestRow = async (): Promise<Locator> => {
    const shapes = [
      '[data-has-shot="true"][data-has-alarm="true"][data-has-notes="true"]',
      '[data-has-shot="true"][data-has-notes="true"]',
      '[data-has-shot="true"]',
      '[data-has-notes="true"]',
    ];
    for (const shape of shapes) {
      const candidate = page.locator(`[data-testid="index-row"]${shape}`).first();
      if ((await candidate.count()) > 0) return candidate;
    }
    return rows.first();
  };

  /** The filter the take applies: three stars or more, and `high`. Shared with the still's `prepare`. */
  const draftFilter = async (target: Page): Promise<Locator> => {
    await target.getByTestId("index-query").click();
    const modal = target.getByTestId("filter-modal");
    await expect(modal).toBeVisible();
    await modal.locator('[data-testid="filter-stars"][data-min="3"]').click();
    await modal.locator('[data-testid="filter-priority"][data-level="high"]').click();
    await expect(modal.getByTestId("filter-apply")).toHaveText(/\d+ results?/, { timeout: 15_000 });
    return modal;
  };

  /** The insert form, filled the way the take fills it — for the still, with plain Playwright. */
  const fillInsert = async (target: Page, url: string): Promise<void> => {
    await target.getByTestId("field-title").fill(NEW_RECORD.title);
    await target.getByTestId("field-url").fill(url);
    await target.getByTestId("tags-suggestion").first().click();
    await target.locator('[data-testid="stars-star"][data-level="4"]').click();
    await target.locator('[data-testid="priority-segment"][data-level="medium"]').click();
    await target.locator('[data-testid="alarm-segment"][data-days="5"]').click();
    await target.getByTestId("shot-file").setInputFiles(SHOT);
    await expect(target.getByTestId("shot-preview")).toBeVisible();
    await expect(target.getByTestId("insert-duplicates")).toHaveAttribute("data-count", /^[1-9]/, {
      timeout: 15_000,
    });
  };

  // The screenshot chapter 6 uploads, drawn before the first frame. Its address bar names the
  // page the new record is about — invented, like the record.
  await drawPage(page.context(), NEW_RECORD.title, "docs.example/guides/keeping-a-tidy-index-follow-up");

  // ── 1 ── Sign in ─────────────────────────────────────────────────────────
  await demo.open("/login/");
  await demo.chapter("Sign in");

  const signIn = page.getByTestId("auth-submit");
  await expect(signIn).toBeVisible();
  await demo.dwell(900);
  await demo.fill(page.getByTestId("login-email"), USERNAME);
  await demo.fill(page.getByTestId("login-password"), PASSWORD);
  await demo.dwell(300);
  await demo.click(signIn);
  await expect(page).toHaveURL(/\/bookmarks/, { timeout: 20_000 });

  // ── 2 ── Index ───────────────────────────────────────────────────────────
  await demo.chapter("Index");

  await expect(rows.first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("rail-category").first()).toBeVisible();
  await demo.dwell(1400);

  // Two urls the index already holds, for the import chapter's csv: read now, while a page of rows
  // is on screen, so the staged table can show a `dup` beside the `new`s.
  const existing = await rows.evaluateAll((nodes) =>
    nodes
      .map((node) => ({
        title: node.querySelector("[data-testid='row-title']")?.textContent ?? "",
        url: node.getAttribute("data-url") ?? "",
      }))
      .filter((row) => row.url !== "")
      .slice(0, 2),
  );
  expect(existing.length, "the page holds no row with a url — reseed the account").toBeGreaterThan(0);

  // Two rows hovered near their title, where the actions appear at the far end; then the tags cell
  // of a tagged row, which answers with the bubble listing every category the row carries.
  await sweep(rows, [1, 3], 600, "text");
  const tagged = page.locator('[data-testid="index-row"]:not([data-tags="0"])').nth(2);
  await demo.moveTo(tagged.getByTestId("row-tags"), { dwell: 500 });
  await expect(bubble).toBeVisible();
  await demo.dwell(700);

  // Then a record, early: the richest row on the page, read off its attributes.
  const hero = await richestRow();
  const heroHasShot = (await hero.getAttribute("data-has-shot")) === "true";
  const heroHasNote = (await hero.getAttribute("data-has-notes")) === "true";
  await demo.click(hero, { aim: "text" });

  // ── 3 ── Record ──────────────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/bookmarks\/\d+/);
  const recordTitle = page.getByTestId("record-title");
  await expect(recordTitle).toBeVisible({ timeout: 15_000 });
  await demo.chapter("Record");

  const shot = page.getByTestId("record-shot");
  if (heroHasShot) await expect(shot).toBeVisible({ timeout: 30_000 });
  const recordUrl = await page.getByTestId("record-url").getAttribute("href");
  expect(recordUrl, "the record has no url").toBeTruthy();
  await demo.dwell(1000);
  if (heroHasNote) await demo.moveTo(page.getByTestId("record-note"), { dwell: 900, aim: "text" });
  if (heroHasShot) await demo.moveTo(shot, { dwell: 900 });
  demo.shot("record");

  // ── 4 ── Edit ────────────────────────────────────────────────────────────
  // The modal is a route (`/bookmarks/<id>/edit`), and a direct visit to it renders the full-page
  // form instead — so the still is filed under the record's address, with the click as its `prepare`.
  demo.shot("edit-modal", async (target) => {
    await target.getByTestId("record-edit").click();
    const modal = target.getByTestId("edit-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByTestId("field-title")).toHaveValue(/./);
  });
  await demo.click(page.getByTestId("record-edit"));
  const edit = page.getByTestId("edit-modal");
  await expect(edit).toBeVisible();
  await demo.chapter("Edit");
  await expect(edit.getByTestId("field-title")).toHaveValue(/./);
  await demo.dwell(1000);

  // Stars: five, unless the record already has five — then three. Priority: a level that is off.
  // A tag: the first suggestion, which is never one the record already carries. Every choice is
  // read off the form, so a second take on the same record still changes something.
  const fiveStars = edit.locator('[data-testid="stars-star"][data-level="5"]');
  const starLevel = (await fiveStars.getAttribute("data-on")) === "true" ? "3" : "5";
  await demo.click(edit.locator(`[data-testid="stars-star"][data-level="${starLevel}"]`));
  await demo.dwell(400);
  await demo.click(edit.locator('[data-testid="priority-segment"][data-state="off"]:not([data-level="none"])').first());
  await demo.dwell(400);
  await demo.click(edit.getByTestId("tags-suggestion").first());
  await expect(edit.getByTestId("tags-token").first()).toBeVisible();
  await demo.dwell(900);
  await demo.click(edit.getByTestId("edit-save"));
  await expect(edit).toHaveCount(0, { timeout: 15_000 });
  await expect(recordTitle).toBeVisible();
  await demo.dwell(1400);

  // ── 5 ── Filters ─────────────────────────────────────────────────────────
  // Back to the index for what the list can do: the rail, the pager, a sort, the filter modal, the
  // export menu.
  await demo.click(tab("list"));
  await expect(page).not.toHaveURL(/categories_id=/);
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  await demo.chapter("Filters");
  await demo.dwell(600);

  // The rail: two of the scopes read, then the category with the most records opened. The count
  // is on the row (`data-count`), so the choice is a fact and not a position.
  await sweep(page.getByTestId("rail-scope"), [0, 2], 500);
  await demo.click(await busiestCategory(page), { aim: "text" });
  await expect(page).toHaveURL(/categories_id=/);
  await expect(rows.first()).toBeVisible();
  await demo.dwell(1200);
  // The still is this view rather than the raw index: the stills are taken after the take, and by
  // then the raw index opens on the batch the take imported — five bare rows above the seeded ones.
  demo.shot("index");

  // The pager, one page on and back; then the stars column sorted from its header.
  await demo.click(page.getByTestId("pager-next"));
  await expect(page).toHaveURL(/page=1/);
  await expect(rows.first()).toBeVisible();
  await demo.dwell(900);
  await demo.click(page.getByTestId("pager-prev"));
  await expect(page).not.toHaveURL(/page=/);
  await demo.dwell(600);
  await demo.click(page.locator('[data-testid="index-header"][data-column="stars"]'));
  await expect(page).toHaveURL(/sort=-stars/);
  await expect(rows.first()).toBeVisible();
  await demo.dwell(1000);

  // The filter modal, from the query field: a star minimum and a priority, counted live, applied.
  await demo.click(page.getByTestId("index-query"));
  const filters = page.getByTestId("filter-modal");
  await expect(filters).toBeVisible();
  await demo.dwell(800);
  await demo.click(filters.locator('[data-testid="filter-stars"][data-min="3"]'));
  await demo.click(filters.locator('[data-testid="filter-priority"][data-level="high"]'));
  const apply = filters.getByTestId("filter-apply");
  await expect(apply).toHaveText(/\d+ results?/, { timeout: 15_000 });
  await expect(filters.getByTestId("filter-matches")).not.toHaveAttribute("data-count", "0");
  await demo.dwell(900);
  demo.shot("filter-modal", async (target) => {
    await draftFilter(target);
  });
  await demo.click(apply);
  await expect(filters).toHaveCount(0);
  await expect(page).toHaveURL(/stars=3/);
  await expect(page).toHaveURL(/priority=high/);
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  await demo.dwell(1200);

  // The export menu: the three formats read, nothing downloaded.
  await demo.click(page.getByTestId("export-menu"));
  const exportMenu = page.getByTestId("export-menu-content");
  await expect(exportMenu).toBeVisible();
  await expect(exportMenu).toContainText(INDEX_TEXT.export.caption);
  await sweep(exportMenu.getByTestId("export-format"), [0, 1, 2], 350);
  await demo.dwell(400);
  await demo.press("Escape");
  await expect(exportMenu).toHaveCount(0);
  await demo.dwell(400);

  // ── 6 ── Insert ──────────────────────────────────────────────────────────
  await demo.click(tab("create"));
  await expect(page).toHaveURL(/\/bookmarks\/create/);
  const urlField = page.getByTestId("field-url");
  await expect(urlField).toBeVisible({ timeout: 15_000 });
  await demo.chapter("Insert");
  await demo.dwell(800);

  // The title first, then the url: the form reads a page's own `<title>` when the url field is
  // left with the title empty, and this url points nowhere.
  await demo.fill(page.getByTestId("field-title"), NEW_RECORD.title);
  await demo.fill(urlField, recordUrl ?? "");
  const duplicates = page.getByTestId("insert-duplicates");
  await expect(duplicates).toBeVisible({ timeout: 15_000 });
  await expect(duplicates).toHaveAttribute("data-count", /^[1-9]/, { timeout: 15_000 });
  await demo.moveTo(duplicates, { dwell: 1300, aim: "text" });

  await demo.click(page.getByTestId("tags-suggestion").first());
  await demo.dwell(300);
  await demo.click(page.locator('[data-testid="stars-star"][data-level="4"]'));
  await demo.dwell(300);
  await demo.click(page.locator('[data-testid="priority-segment"][data-level="medium"]'));
  await demo.dwell(300);
  await demo.click(page.locator('[data-testid="alarm-segment"][data-days="5"]'));
  await demo.dwell(500);

  // The screenshot, through the picker the button raises — the one dialogue Playwright answers
  // for the hand. A picture this file drew before the first frame.
  const shotChooser = page.waitForEvent("filechooser");
  await demo.click(page.getByTestId("shot-choose"));
  await (await shotChooser).setFiles(SHOT);
  await expect(page.getByTestId("shot-preview")).toBeVisible();
  await demo.dwell(1300);
  demo.shot("insert", async (target) => {
    await fillInsert(target, recordUrl ?? "");
  });
  await demo.click(page.getByTestId("insert-commit"));
  await expect(page).toHaveURL(/\/bookmarks\/?(\?|$)/, { timeout: 30_000 });
  await expect(rows.filter({ hasText: NEW_RECORD.title }).first()).toBeVisible({ timeout: 15_000 });
  await demo.dwell(1400);

  // ── 7 ── Alarms ──────────────────────────────────────────────────────────
  await demo.click(tab("reminders"));
  const alarms = page.getByTestId("alarm-row");
  await expect(alarms.first()).toBeVisible({ timeout: 20_000 });
  await demo.chapter("Alarms");
  await expect(page.getByTestId("alarms-load")).toBeVisible({ timeout: 20_000 });
  await demo.dwell(1400);
  demo.shot("alarms");

  // The fortnight's load, four bars of it. Each bar carries its day and its count as a native title.
  await sweep(page.getByTestId("alarm-load-bar"), [0, 4, 9, 13], 500);
  await demo.dwell(300);

  // One running alarm snoozed, then resumed. Keyed on its id rather than its position: a sleeping
  // alarm sorts to the bottom of the list, so "the second running row" is somebody else by then.
  const candidate = page.locator('[data-testid="alarm-row"][data-paused="false"]').nth(1);
  await expect(candidate, "fewer than two running alarms — reseed the account").toBeVisible();
  const alarmId = await candidate.getAttribute("data-alarm-id");
  const alarm = page.locator(`[data-testid="alarm-row"][data-alarm-id="${alarmId}"]`);
  await demo.moveTo(alarm, { aim: "text", dwell: 600 });
  await demo.click(alarm.locator('[data-testid="alarm-snooze"][data-action="snooze"]'));
  await expect(alarm).toHaveAttribute("data-paused", "true", { timeout: 15_000 });
  await expect(alarm).toContainText(ALARMS_TEXT.row.paused);
  await demo.dwell(1200);
  await demo.click(alarm.locator('[data-testid="alarm-snooze"][data-action="resume"]'));
  await expect(alarm).toHaveAttribute("data-paused", "false", { timeout: 15_000 });
  await demo.dwell(1200);

  // ── 8 ── Import ──────────────────────────────────────────────────────────
  writeImportFiles(existing);
  await demo.click(tab("upload"));
  const drop = page.getByTestId("import-drop");
  await expect(drop).toBeVisible({ timeout: 20_000 });
  await demo.chapter("Import");
  await demo.dwell(900);

  const importChooser = page.waitForEvent("filechooser");
  await demo.click(page.getByTestId("import-choose"));
  await (await importChooser).setFiles(IMPORT_FILE);
  const staged = page.getByTestId("import-staged");
  await expect(staged).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('[data-testid="import-staged-row"][data-state="DUP"]').first()).toBeVisible();
  await demo.dwell(1200);
  await sweep(page.getByTestId("import-staged-row"), [0, 2, 5], 450, "text");
  await demo.moveTo(page.locator('[data-testid="import-option"][data-option="skipDuplicates"]'), { dwell: 600 });
  await demo.dwell(400);
  demo.shot("import", async (target) => {
    await target.getByTestId("import-file").setInputFiles(IMPORT_STILL_FILE);
    await expect(target.getByTestId("import-staged")).toBeVisible({ timeout: 20_000 });
  });
  await demo.click(page.getByTestId("import-send"));
  await expect(page).toHaveURL(/\/bookmarks\/?(\?|$)/, { timeout: 30_000 });
  await expect(rows.filter({ hasText: NEW_LINKS[0][0] }).first()).toBeVisible({ timeout: 15_000 });
  await demo.dwell(1400);

  // ── 9 ── Account ─────────────────────────────────────────────────────────
  // `UserMenu` is mounted twice — in the chrome's meta row and in the narrow-width drawer, which
  // sits off-screen and inert at 1920px but still has a box — so the mark is scoped to the row.
  await demo.click(page.getByTestId("chrome-meta").getByTestId("user-menu"));
  const menu = page.getByTestId("user-menu-content");
  await expect(menu).toBeVisible();
  await demo.chapter("Account");
  await sweep(menu.getByTestId("user-menu-item"), [0, 1], 500);
  await demo.dwell(900);
  await demo.press("Escape");
  await expect(menu).toHaveCount(0);

  // ── 10 ── At rest ────────────────────────────────────────────────────────
  // Off-frame on the same beat, so the pointer's teleport hides under the last hover fading out.
  await demo.park(-40, -40);
  await demo.dwell(1800);
  // One last pointer move, which nobody sees. The screencast emits a frame only when something
  // is drawn and the recorder holds its final frame for a single sixtieth of a second, so on a
  // still closing shot the hold above is what would be lost.
  await demo.park(-41, -41);
});
