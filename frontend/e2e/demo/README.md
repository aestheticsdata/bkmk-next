# Demo films

One Playwright run that drives the app the way a hand would, records it as a single continuous
video, and writes the chapter list beside it. No editing: the take *is* the video, and the chapter
file is what goes in the description.

```bash
pnpm video:generate
```

Output lands in `e2e/demo/out/` (gitignored):

- `bkmk-demo.mp4` — the take, h264, at the exact viewport size, no scaling, with the chapters
  written into the file itself
- `chapters.txt` — `0:00 Title` per line, for a human to read
- `chapters.vtt` — WebVTT, for `<track kind="chapters">` on the portfolio's own `<video>`
- `chapters.ffmeta` — ffmpeg metadata; already applied to the mp4, kept so a re-encode can reapply it
- `chapters.json` — the same marks with millisecond precision
- `shots/01-record.png` and six more — stills at 3840×2160, for a page that wants pictures too
- `upload/page.png` and `upload/bookmarks.csv` — the screenshot chapter 5 attaches and the export
  chapter 7 imports, both drawn by the storyboard itself

This is a port of PFA's harness, which is a port of Trekker's, which is a port of Zeus's, which is
a port of Spira's. `pacing.ts`, `recorder.ts`, `chapters.ts` and `cursor.ts` are byte-identical to
PFA's; `fixture.ts` is PFA's, `Demo.glide` included, with the output name changed; `preflight.ts`,
`demo.setup.ts` and `playwright.demo.config.ts` are the same files with the bkmk-specific parts
changed. The full write-up of how it works and why — the CDP screencast, the drawn pointer, the
encode, and every trap found building it — is `front/e2e/demo/HOW-TO-FILM-A-DEMO.md` in the Spira
repo, and Zeus's `e2e/demo/README.md` carries the traps that console found. Only `bkmk.demo.ts`
knows what bkmk is.

One departure from the copies: the config loads its two env files through Node's own
`process.loadEnvFile` rather than `dotenv`, which nothing else in this front depends on.

## What it needs before it will record

**The run starts the app itself.** `webServer` in `playwright.demo.config.ts` brings up the API and
the front when nothing answers on their ports, and films whatever is already there when something
does — a `pnpm dev` of yours, the pm2 `bkmk-server`. `preflight.ts` then refuses to launch a browser
until the three below are true, and names whichever one is not. The rest it cannot check.

1. **The front on `localhost:3100`** — `next dev -p 3100`, started by the run or by `pnpm dev`, and
   that is what the takes are filmed on: the two things a dev build floats over the page, Next's
   dev-tools badge (bottom left) and the TanStack devtools logo (bottom right), are painted out by
   `hideDevChrome()` in `fixture.ts`, and every screen is visited by the take itself before it
   matters. The production build works too (`pnpm build && pnpm start`, on the same port — the
   API's CORS names that one origin, `FRONTEND_URL` in `backend/ecosystem.config.js`).
2. **The API, on the origin the page talks to** — `NEXT_PUBLIC_REMOTE_HOST_FROM_LOCALHOST` in
   `frontend/.env.local`, which the config loads so that the server it starts, preflight and the
   setup project all use the origin the film will. Today that is `http://localhost:3101`. The run
   starts it through `backend/scripts/dev-api.js` (`node scripts/dev-api.js` in `backend/` by hand) — pm2's `--env dev`
   without the daemon, because Playwright needs the process to stay attached. `GET /users/csrf` is
   what preflight probes; its 401 is the answer it wants. `DEMO_API_URL` overrides the origin.
3. **`DEMO_USERNAME` / `DEMO_PASSWORD` in `frontend/.env.test.local`** — the house dev account,
   `local.dev@mock.io`. Copy `.env.test.local.example` beside it. Never a real credential: the
   video is for a public page, and the take types the password on camera (masked).
4. **ffmpeg on `PATH`** with libx264, the mp4 muxer and the `concat` demuxer — `brew install ffmpeg`,
   or `DEMO_FFMPEG` pointing at one.
5. **The seeded account, seeded on the day** — see below.

`settle()` in `fixture.ts` adds one more check on the real page: every stylesheet the document
asked for has loaded and `document.fonts.ready` has resolved before a frame is kept. bkmk serves
its faces through `next/font/google`, so it never fires here; it is kept because the six harnesses
are copies of each other.

## The data, and what it must never contain

The take films the seeder's invented index on `local.dev@mock.io` (`backend/docs/seeding.md`): the
house dev account every project here uses, filled by `pnpm seed`, with hosts under the reserved
`.example` domain, titles from a word list, notes from templates. Nothing real is on screen — no
real account, no real link — and the two files the take uploads are drawn by the storyboard before
the first frame: a picture of a page that does not exist, and a `title;url` export half of whose
lines the index already holds.

The seeder dates the alarms **from the day it runs**: an alarm meant to ring in two days is armed
`frequency − 2` days ago, and the alarms screen counts down against the server's `CURDATE()`. So
before a take, on the day of the take:

```bash
cd backend && pnpm seed -- --wipe
```

A set seeded last week has drifted by a week — `T-02d` has already rung, the fourteen-day chart has
moved — and the take will still run, on a screen that is less interesting than it should be.

## The take

Nine chapters, **117.5s — one minute fifty-eight**, at the default `DEMO_SPEED=1`.

| | |
|---|---|
| Sign in | the login form, the house account typed, the password masked |
| Index | two rows hovered for their actions, a tags cell for its bubble, and a record opened straight away — the richest row on the page, read off `data-has-shot` / `data-has-notes` / `data-has-alarm` |
| Record | the note and the preview read |
| Edit | the modal over the record: five stars, a priority that was off, a tag from the suggestions, saved |
| Filters | back on the index: two rail scopes hovered, the category with the most records opened (`data-count` on the rows, never the first); the pager one page on and back; the stars column sorted from its header; the filter modal from the query field — `3+` and `high`, counted live, applied; the export menu opened, its three formats read, closed by ⎋ |
| Insert | the title typed, then a url the index already holds (the duplicates panel counts it), a tag, four stars, `medium`, an alarm every 5 days, the drawn screenshot through the picker, committed — it lands at the top of the index |
| Alarms | the table, four bars of the load chart hovered, one running alarm snoozed then resumed |
| Import | the generated csv through the picker, the staged table with its `new` and `dup` rows, the options, sent — the batch lands at the top of the index |
| Account | the user menu opened and closed |

The record comes second rather than after the list's tour, on the owner's call: a viewer should see
a bookmark opened within the first half-minute, and the filters can wait.

## The stills

`demo.shot("name", prepare?)` marks seven screens. It takes no picture at the time — it writes down
the URL, and the pictures are taken at the very end, once the recorder has stopped and the mp4 is
closed, by sending the same signed-in page back to each URL. They come out at 3840×2160, lossless
PNG, animations frozen, caret hidden, the harness's overlays painted out.

Four of them show something a URL cannot hold, so they pass a `prepare` step run on the revisited
page after it has settled and before the shutter: the filter modal (opened, the same two segments
clicked, the count waited for), the edit modal (opened over the record — see the traps), the insert
form (filled in with plain Playwright, the file set on the input, nothing committed) and the staged
import (a second csv set on the input, nothing sent — the take's own file is all `dup` by then,
since the take committed it, so the still gets links of its own that are never sent).

Two of them are not the screen the chapter opens on. The index still is the busiest category's
page, because the raw index opens on whatever was added last — and after the take that is the
imported batch, five bare rows above the seeded ones. The edit still is filed under the record's
address, for the reason the traps give.

## Running it again

**The take writes three things into the seeded account** — a record, an imported batch, an edited
record — and none of them breaks the next take: the new record's url is the one the index already
held, so the duplicates panel counts one more; the batch stages as `dup` next time and `skip
duplicates` passes it over; the edit reads the form before choosing what to change. The one thing
it changes and puts back on camera is the snoozed alarm, and `demo.setup.ts` wakes every alarm of
the account before a take (`PATCH /reminders`) in case a previous one stopped between the snooze
and the resume.

What accumulates is the index itself: one record and five imported ones per take. `pnpm seed --
--wipe` in `backend/` rebuilds the account from scratch, and re-dates the alarms while it is at it.

Nothing is ever deleted. This app puts `delete` beside `edit` on every row, every record and both
shells of the edit form — so rows are hovered near their text (`aim: "text"`), every control is
aimed by its own mark, and the modals are left by their buttons or by ⎋.

⚠️ **One live session per account.** Every sign-in — the setup project's, then the take's own —
revokes the others (`backend/src/routes/controllers/users/helpers/signInHelper.js`). Your own tab
on `local.dev@mock.io` is signed out the moment a take starts, and a sign-in of yours mid-take 401s
every request the film makes.

Nothing that moves is asserted: every countdown is relative to today, every date is the seeder's.
Waits are on the things the seeder fixes — a row with a screenshot and an alarm, a running alarm, a
url the index holds.

## bkmk-specific traps

**The edit modal is a route.** `edit` navigates to `/bookmarks/<id>/edit`, which Next intercepts
into a dialog over the screen you were on — and renders as a full-page form when the address is
visited directly. So the still is filed under the *record's* address, with the click as its
`prepare`, and `demo.shot("edit-modal")` is called before the modal opens, while `page.url()` is
still the record's.

**A snoozed alarm moves.** The list is ordered imminence first and sleeping rows last, so the row
the take snoozes is somewhere else after the refetch. It is keyed by `data-alarm-id`, read before the
click, never by position.

**The tags bubble is the row's, not the cell's.** The index row's title link covers the whole row
with a pseudo-element, so the tags cell cannot be its own hover trigger; the row listens and shows
the bubble when the pointer is over the cell's rectangle. The take moves the hand to the cell
(`row-tags`) and asserts the bubble (`cursor-tooltip`), which fails the take if the hover missed.

**The load chart's hover is a native `title`.** Each bar carries its day and count as a `title`
attribute, and headless Chromium paints no tooltip for those — the beat shows the hand walking the
bars and nothing else. Anything more is a change to the chart, not to the harness.

**The file inputs are `sr-only` behind labels.** Both the screenshot and the import file are picked
through the dialogue the label's click raises, which is the one dialogue Playwright answers for the
hand (`waitForEvent("filechooser")`). The stills set the file on the input directly.

**The url field reads the page's `<title>` on blur.** Only into an empty title, so the take types
the title first — the url points nowhere, and a request to it would only cost the field a
`reading…` it never fills.

**The rail is alphabetical.** The category with the most records is `reading`, by the seeder's
weights, and not the first row; the storyboard reads `data-count` off every row and picks the
maximum, so a reseed with other weights still films the right one.

**`UserMenu` is mounted twice.** The chrome's meta row and the narrow-width drawer both render it,
and the drawer's copy sits off-screen and inert at 1920px but still has a box, so `user-menu` alone
resolves to two elements. The storyboard scopes it to the meta row (`chrome-meta`).

**`category.name` is unique across accounts on the live database**, which `bkmk.sql` does not
declare — the seeder names its categories to avoid the real index's and refuses when one collides.
Not the harness's business, but the reason the seeded categories are called `code` and `lab`.

## Knobs

The same as PFA's, all environment variables: `DEMO_SPEED`, `DEMO_HEADED=1`, `DEMO_WIDTH` /
`DEMO_HEIGHT`, `DEMO_SCALE=1`, `DEMO_TITLES=on`, `DEMO_CURSOR=off`, `DEMO_FPS`, `DEMO_CRF`,
`DEMO_FFMPEG`, `DEMO_RECORDER=playwright`, `E2E_BASE_URL` (default `http://localhost:3100`), plus
`DEMO_API_URL` (default: `NEXT_PUBLIC_REMOTE_HOST_FROM_LOCALHOST` from `.env.local`, then
`http://localhost:3101` — what preflight probes and the setup signs in to).

## What this run actually measured

On an 8-core M1, at 1920×1080 with the default 2× supersampling, against `next dev` and the API
started by the run itself.

| | |
|---|---|
| The take | **117.5s — one minute fifty-eight**, 9 chapters, **2956 frames at 25.2fps** — the app repaints on hover and on every route change, and sits still between them, so the screencast lands near its floor as the other five do |
| The chapters | 0:00 Sign in · 0:07 Index · 0:14 Record · 0:20 Edit · 0:33 Filters · 1:01 Insert · 1:25 Alarms · 1:41 Import · 1:53 Account |
| The file | **7.0 MB**, h264, 1920×1080, chapters inside it |
| Stills | 7 × 3840×2160 PNG, 185–843 KB each, 3.1 MB the set |
| The cuts | a first take with the record after the list's tour came out at 145.9s; opening it second and trimming the dwells by a third took twenty-eight seconds off, on the owner's call |
| The dry run | the same storyboard at `DEMO_SPEED=4` found the one mark rendered twice (see the traps) |
| The whole run | 2.8 minutes wall-clock, servers started by the run included |

## What this ticket changed outside the harness

- `package.json`: `video:generate`, `@playwright/test` on PFA's major. `.env.test.local.example`:
  `DEMO_USERNAME` / `DEMO_PASSWORD`. `tsconfig.json`: the `@e2e/*` alias.
- `frontend/.gitignore`: `e2e/demo/out/` and `.env.test.local`.
- ~70 `data-testid`s across `src/components/`, one per mark the storyboard touches, with a `data-*`
  companion wherever a choice depends on data — the login fields and the submit, the chrome's tabs
  (`data-tab`), the user menu and its items, the rail rows (`data-count`, `data-category-id`) and
  scopes (`data-scope`), the command bar's query field, sort, filter and export menu
  (`data-format`), the column headers (`data-column`), the index rows (`data-id`, `data-has-shot`,
  `data-has-alarm`, `data-has-notes`, `data-stars`, `data-priority`, `data-tags`, `data-url`) with
  their title, tags cell and three actions, the pager, the filter modal and its segments
  (`data-min`, `data-level`, `data-state`, `data-field`) and count (`data-count`), the cursor
  tooltip, the record's title, url, note, preview and command bar, the edit modal and its footer,
  the three text fields, the tag field (`data-tag`, `data-category-id`), the priority
  (`data-level`), stars (`data-level`, `data-on`) and alarm (`data-days`) segments, the screenshot
  field, the insert command bar and duplicates panel (`data-count`), the alarm rows
  (`data-alarm-id`, `data-paused`, `data-days`) and their two buttons (`data-action`), the load
  chart bars (`data-day`, `data-count`), the alarms command bar, the import drop zone, file, staged
  rows (`data-state`, `data-at`), summary, options (`data-option`) and command bar. The `ds/` and
  `ui/` primitives already spread their rest props; `RailRow`, `ScopeRow`, `PagerArrow` and
  `CheckLine` took a prop for it.
