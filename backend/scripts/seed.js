#!/usr/bin/env node
/* Filling the house dev account with an invented index (BMK-72).
 *
 *   pnpm seed -- [--wipe] [--email <address>]
 *
 * The account is looked up **by email at runtime** — `local.dev@mock.io` unless `--email` says
 * otherwise — and the script refuses to run when it does not exist: it fills an account, it never
 * creates one. `docs/seeding.md` is the guide.
 *
 * ⚠️ **Nothing here comes from a real index.** Every host is under the reserved `.example` domain,
 * every title is assembled from the word lists below, every note is a template. The set exists to be
 * filmed (BMK-73) and shown on a public page, so a real record in it would be a leak.
 *
 * ⚠️ **The alarms are dated from today, on purpose.** An alarm has no next-fire column: it repeats
 * every `frequency` days from `date_added`, and every screen computes the countdown against
 * `CURDATE()` (`getRemindersController`). So `date_added` is written as
 * `today - (frequency - daysUntil) - n * frequency`, which puts the next firing exactly `daysUntil`
 * days out — on the day the seeder runs. Run it again on the day of a take: a set seeded last week
 * has drifted by a week.
 *
 * `--wipe` empties the account first — records, urls, alarms, categories, import runs, and the
 * screenshot files under its upload folder — and rebuilds from scratch. Without it the set is
 * appended to whatever is there, categories being reused by name; two runs are two copies of the set.
 *
 * The generator is seeded, so two `--wipe` runs produce the same records. Only the dates move with
 * the calendar.
 */
const { mkdir, rm } = require("node:fs/promises");
const path = require("node:path");
const { format, subDays } = require("date-fns");
const jimp = require("jimp");
const mysql = require("mysql2/promise");
const { v1: uuidv1 } = require("uuid");
const { readConnectionSettings } = require("../src/db/connectionSettings");
const { normaliseUrl } = require("../src/helpers/normaliseUrl");
const { uploadPath } = require("../src/routes/controllers/bookmarks/helpers/constants");

const HOUSE_EMAIL = "local.dev@mock.io";

/** How many records the set holds, before the fixed ones below. */
const RECORDS = 300;

/** The intervals the form offers — `frontend/src/components/bookmarks/fields/constants.ts`. The
 *  planned alarms below are checked against it at load, so a typo cannot seed a countdown no screen
 *  can express. */
const ALARM_FREQUENCIES = [1, 2, 5, 10, 15, 30];

/* ── The word lists ──────────────────────────────────────────────────────────────────────────────
 *
 * Eight categories, each with a host of its own and a dozen topics; twelve forms a title can take.
 * `weight` is how often a record lands in the category — `reading` is deliberately the busiest, so
 * that a rail read by `data-count` has an unambiguous answer, and not the first row of it: the rail
 * is alphabetical, and a storyboard that happened to pick the first row would look right by accident.
 *
 * ⚠️ **The names must not be a name another account already has.** The live database carries a
 * `UNIQUE KEY (name)` on `category` that `bkmk.sql` does not declare — measured, not read: the first
 * run failed on `dev`, which the copy of the real index owns. The seeder checks before it writes and
 * names the collision; it never borrows another account's row, which the application scopes by
 * `user_id` everywhere it reads one. */
const CATEGORIES = [
  { name: "code", color: "#5b8def", host: "forge.example", weight: 4 },
  { name: "design", color: "#c46bb8", host: "gallery.example", weight: 3 },
  { name: "reading", color: "#d9a441", host: "paper.example", weight: 5 },
  { name: "music", color: "#e0725c", host: "radio.example", weight: 2 },
  { name: "recipes", color: "#7fb069", host: "kitchen.example", weight: 2 },
  { name: "tools", color: "#4fb3bf", host: "toolbox.example", weight: 3 },
  { name: "lab", color: "#8f7ee6", host: "lab.example", weight: 2 },
  { name: "travel", color: "#5aa9a0", host: "atlas.example", weight: 1 },
];

const TOPICS = {
  code: [
    "pnpm workspaces",
    "a CommonJS to ESM move",
    "the React Compiler",
    "container queries",
    "the CDP screencast",
    "prepared statements",
    "zod at the boundary",
    "a session store on Redis",
    "soft deletes",
    "a migration runner",
    "double-submit CSRF",
    "keyset pagination",
  ],
  design: [
    "hairline borders",
    "a monospace interface",
    "the 8px rhythm",
    "tabular figures",
    "dense tables",
    "a teal accent",
    "empty states",
    "a filter modal",
    "dashed slots",
    "focus rings",
    "a status bar",
    "twelve-pixel type",
  ],
  reading: [
    "long-form interviews",
    "reading lists",
    "the commonplace book",
    "marginalia",
    "slow news",
    "a reading log",
    "the weekly digest",
    "translated essays",
    "annotated editions",
    "second readings",
    "the reading chair",
    "a summer syllabus",
  ],
  music: [
    "tracker modules",
    "a four-track workflow",
    "chiptune scales",
    "the demoscene archive",
    "field recordings",
    "modular patches",
    "tape saturation",
    "live coding sets",
    "a listening diary",
    "drum machine presets",
    "the vinyl shelf",
    "late night radio",
  ],
  recipes: [
    "sourdough timing",
    "a weeknight ragu",
    "pickled shallots",
    "the pressure cooker",
    "brown butter",
    "a lentil soup",
    "flatbreads",
    "the Sunday roast",
    "cold brew ratios",
    "a lemon tart",
    "miso glazes",
    "the stock pot",
  ],
  tools: [
    "a tiling window manager",
    "shell aliases",
    "the clipboard manager",
    "a static site generator",
    "the terminal multiplexer",
    "dotfiles",
    "a password manager",
    "the note-taking app",
    "file synchronisation",
    "the label printer",
    "a mechanical keyboard",
    "backup rotation",
  ],
  lab: [
    "the Kuiper belt",
    "tide tables",
    "a star atlas",
    "plate tectonics",
    "the carbon cycle",
    "extremophiles",
    "the solar minimum",
    "radio telescopes",
    "glacier cores",
    "the periodic table",
    "bird migration",
    "a home weather station",
  ],
  travel: [
    "night trains",
    "a canal walk",
    "the coastal path",
    "packing light",
    "a cabin week",
    "the mountain hut",
    "ferry timetables",
    "a city on foot",
    "the long way round",
    "offline maps",
    "a winter market",
    "the harbour town",
  ],
};

const FORMS = [
  "Notes on %s",
  "%s, explained",
  "A field guide to %s",
  "What I learned about %s",
  "%s in practice",
  "The case for %s",
  "%s: a checklist",
  "Revisiting %s",
  "Getting started with %s",
  "%s, one year on",
  "A short history of %s",
  "Why %s matters",
];

const NOTES = [
  "Read the second half first — the opening is padding.",
  "Pairs well with the entry on %s.",
  "Worth a second read before the next %s.",
  "Three takeaways:\n- keep the setup small\n- measure before changing anything\n- write the reason down",
  "Follow-up thread at https://notes.example/threads/%slug% — the comments are better than the piece.",
  "Bookmarked for the diagram halfway down.",
  "The author's older piece on %s covers the same ground in half the words.",
  "Sent by a friend, not read yet.",
];

/* The fixed records: the ones a storyboard needs to exist whatever the dice said.
 *
 * `tidy` is the record the film opens on — a screenshot, a note and an armed alarm, dated today so
 * it sits on the first page. Its url is also carried by `mirror`, which is what makes the insert
 * screen's duplicates panel count to two when that url is typed again. */
const TIDY_URL = "https://docs.example/guides/keeping-a-tidy-index";

const FIXED = [
  {
    key: "tidy",
    title: "Keeping a tidy index: a field guide",
    url: TIDY_URL,
    categories: ["code", "tools"],
    stars: 4,
    priority: "high",
    notes:
      "The one to reread when the index gets noisy.\n\nSee also https://notes.example/threads/tidy-index for the follow-up — the comments are the useful part.",
    shot: true,
    alarm: { frequency: 5, daysUntil: 2 },
    daysAgo: 0,
  },
  {
    key: "mirror",
    title: "Keeping a tidy index (mirror)",
    url: TIDY_URL,
    categories: ["code"],
    stars: 3,
    priority: "",
    daysAgo: 214,
  },
  {
    title: "Container queries, one year on",
    url: "https://gallery.example/design/container-queries-one-year-on",
    categories: ["design", "code"],
    stars: 5,
    priority: "highest",
    notes: "The section on fallbacks is the one to keep.",
    shot: true,
    daysAgo: 1,
  },
  {
    title: "A field guide to sourdough timing",
    url: "https://kitchen.example/recipes/a-field-guide-to-sourdough-timing",
    categories: ["recipes"],
    stars: 4,
    priority: "medium",
    shot: true,
    alarm: { frequency: 15, daysUntil: 1 },
    daysAgo: 3,
  },
  {
    title: "The demoscene archive, explained",
    url: "https://radio.example/music/the-demoscene-archive-explained",
    categories: ["music"],
    stars: 5,
    priority: "",
    notes: "Start with the 1993 entries.",
    shot: true,
    daysAgo: 12,
  },
  {
    title: "Notes on a home weather station",
    url: "https://lab.example/lab/notes-on-a-home-weather-station",
    categories: ["lab", "tools"],
    stars: 3,
    priority: "low",
    shot: true,
    alarm: { frequency: 30, daysUntil: 2 },
    daysAgo: 27,
  },
  {
    title: "Night trains: a checklist",
    url: "https://atlas.example/travel/night-trains-a-checklist",
    categories: ["travel"],
    stars: 2,
    priority: "high",
    notes: "Book the couchette, not the seat.",
    shot: true,
    daysAgo: 40,
  },
];

/* Every frequency the form offers, at least twice, with countdowns spread from today to the end of
 * the fortnight — so the alarms table has imminent rows in oxide and the load chart has bars on
 * more than one day. `daysUntil` must stay below `frequency`. */
const ALARMS = [
  { frequency: 1, daysUntil: 0 },
  { frequency: 1, daysUntil: 0 },
  { frequency: 2, daysUntil: 1 },
  { frequency: 2, daysUntil: 0 },
  { frequency: 5, daysUntil: 4 },
  { frequency: 5, daysUntil: 0 },
  { frequency: 10, daysUntil: 3 },
  { frequency: 10, daysUntil: 7 },
  { frequency: 15, daysUntil: 9 },
  { frequency: 15, daysUntil: 13 },
  { frequency: 30, daysUntil: 1 },
  { frequency: 30, daysUntil: 16 },
  { frequency: 30, daysUntil: 25 },
];

for (const alarm of [...ALARMS, ...FIXED.map((record) => record.alarm).filter(Boolean)]) {
  if (!ALARM_FREQUENCIES.includes(alarm.frequency) || alarm.daysUntil >= alarm.frequency) {
    throw new Error(`seed: alarm ${JSON.stringify(alarm)} is not one the form can express`);
  }
}

/* ── A seeded generator ───────────────────────────────────────────────────────────────────────── */
let seed = 0x2f6e2b1;

const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
};

const pick = (list) => list[Math.floor(random() * list.length)];

const between = (min, max) => min + Math.floor(random() * (max - min + 1));

/** One entry of `[value, weight]` pairs, by weight. */
const weighted = (table) => {
  let roll = random() * table.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [value, weight] of table) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return table[table.length - 1][0];
};

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const day = (daysAgo) => format(subDays(new Date(), daysAgo), "yyyy-MM-dd");

/** The day an alarm has to have been armed on for its next firing to land `daysUntil` days out.
 *  `n` extra periods make it look older without moving that date — the countdown is a modulo. */
const alarmDate = ({ frequency, daysUntil }, periods) => day(frequency - daysUntil + periods * frequency);

/* ── The records ──────────────────────────────────────────────────────────────────────────────── */
const STARS = [
  [0, 25],
  [1, 10],
  [2, 15],
  [3, 20],
  [4, 18],
  [5, 12],
];

const PRIORITIES = [
  ["", 35],
  ["low", 20],
  ["medium", 20],
  ["high", 15],
  ["highest", 10],
];

/** How far back a record was filed: mostly recent, some old, none in the future. */
const AGE = [
  [() => between(0, 90), 40],
  [() => between(91, 400), 35],
  [() => between(401, 1000), 25],
];

const noteFor = (category, title) => {
  const template = pick(NOTES);
  return template.replace("%s", pick(TOPICS[category])).replace("%slug%", slugify(title).slice(0, 40));
};

/** The invented records, the fixed ones first. Titles are unique: a title the dice produced twice
 *  gets a numbered suffix rather than a second row nobody can tell from the first. */
const generateRecords = () => {
  const titles = new Set();
  const records = [];

  const categoryTable = CATEGORIES.map((category) => [category.name, category.weight]);

  const unique = (title) => {
    let candidate = title;
    for (let n = 2; titles.has(candidate); n += 1) candidate = `${title} (${n})`;
    titles.add(candidate);
    return candidate;
  };

  for (const fixed of FIXED) {
    records.push({
      ...fixed,
      title: unique(fixed.title),
      notes: fixed.notes ?? null,
      shot: Boolean(fixed.shot),
      alarm: fixed.alarm ?? null,
      modifiedDaysAgo: null,
    });
  }

  let alarmsLeft = [...ALARMS];

  for (let index = 0; index < RECORDS; index += 1) {
    const primary = weighted(categoryTable);
    const categories = [primary];
    if (random() < 0.25) {
      const second = weighted(categoryTable);
      if (second !== primary) categories.push(second);
    }

    const topic = pick(TOPICS[primary]);
    const title = unique(capitalise(pick(FORMS).replace("%s", topic)));
    const host = CATEGORIES.find((category) => category.name === primary).host;
    const url = random() < 0.05 ? null : `https://${host}/${primary}/${slugify(title)}`;
    const daysAgo = weighted(AGE)();

    // Every fourth-or-so record past the fixed ones carries one of the planned alarms, until the
    // list runs out: spread through the set rather than bunched at the top of it.
    let alarm = null;
    if (alarmsLeft.length > 0 && random() < 0.08) {
      alarm = alarmsLeft[0];
      alarmsLeft = alarmsLeft.slice(1);
    }

    records.push({
      title,
      url,
      categories,
      stars: weighted(STARS),
      priority: weighted(PRIORITIES),
      notes: random() < 0.33 ? noteFor(primary, title) : null,
      shot: false,
      alarm,
      daysAgo,
      modifiedDaysAgo: random() < 0.15 ? between(0, daysAgo) : null,
    });
  }

  // Whatever the dice left over goes on the last records, so every planned alarm exists.
  for (const alarm of alarmsLeft) {
    const record = records.findLast((candidate) => !candidate.alarm && !candidate.key);
    if (record) record.alarm = alarm;
  }

  return records;
};

/* ── The screenshots ──────────────────────────────────────────────────────────────────────────── */

/** A picture of a page that does not exist: a dark address bar, the title in large type, and grey
 *  bars where the paragraphs would be. 1024 wide, which is what `jimpHelper` resizes an upload to. */
const drawScreenshot = async (fonts, record, file) => {
  const image = new jimp(1024, 640, "#f3f1ea");
  image.composite(new jimp(1024, 52, "#2a2d31"), 0, 0);
  image.composite(new jimp(760, 26, "#3d4147"), 132, 13);
  image.print(fonts.address, 148, 17, record.url ? record.url.replace(/^https?:\/\//, "") : "about:blank");
  image.print(fonts.title, 64, 104, { text: record.title }, 896);

  let y = 236;
  for (const width of [880, 840, 900, 620, 0, 860, 790, 880, 540, 0, 900, 700]) {
    if (width > 0) image.composite(new jimp(width, 12, "#cfcac0"), 64, y);
    y += 26;
  }

  await image.writeAsync(file);
};

/* ── The database ─────────────────────────────────────────────────────────────────────────────── */

const usage = () => {
  console.error("usage: pnpm seed -- [--wipe] [--email <address>]\n\n  see docs/seeding.md");
  process.exit(1);
};

const parseArguments = (argv) => {
  const options = { wipe: false, email: HOUSE_EMAIL };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--wipe") {
      options.wipe = true;
    } else if (argv[index] === "--email") {
      index += 1;
      if (!argv[index]) usage();
      options.email = argv[index];
    } else {
      usage();
    }
  }
  return options;
};

/** Everything the account holds, taken out in foreign-key order. `url` and `alarm` carry no owner,
 *  so their rows are collected off the bookmarks before those go.
 *
 *  ⚠️ **Refused on an account the seeder did not fill.** The house account on this machine is the
 *  local copy of the real index, renamed in place — and `--wipe` would take that copy with it. What
 *  tells a seeded account from a real one is its categories: the seeder writes exactly the eight
 *  names above and nothing else, so a category it never wrote is a record set it must not delete.
 *  `ACCOUNTS.md` says which account is which. */
const wipeAccount = async (conn, userId) => {
  const [foreign] = await conn.query("SELECT name FROM category WHERE user_id = ? AND name NOT IN (?)", [
    userId,
    CATEGORIES.map((category) => category.name),
  ]);
  if (foreign.length > 0) {
    throw new Error(
      `--wipe refused: this account carries ${foreign.length} categor${foreign.length === 1 ? "y" : "ies"} the seeder ` +
        `never wrote (${foreign
          .slice(0, 5)
          .map((row) => row.name)
          .join(
            ", ",
          )}${foreign.length > 5 ? ", …" : ""}) — it is not a seeded account, and wiping it would destroy real records`,
    );
  }

  const [rows] = await conn.execute("SELECT url_id, alarm_id FROM bookmark WHERE user_id = ?", [userId]);
  const urlIds = rows.map((row) => row.url_id).filter((id) => id !== null);
  const alarmIds = rows.map((row) => row.alarm_id).filter((id) => id !== null);

  await conn.execute(
    "DELETE bc FROM bookmark_category bc INNER JOIN bookmark b ON b.id = bc.bookmark_id WHERE b.user_id = ?",
    [userId],
  );
  await conn.execute("DELETE FROM bookmark WHERE user_id = ?", [userId]);
  if (urlIds.length > 0) await conn.query("DELETE FROM url WHERE id IN (?)", [urlIds]);
  if (alarmIds.length > 0) await conn.query("DELETE FROM alarm WHERE id IN (?)", [alarmIds]);
  await conn.execute("DELETE FROM category WHERE user_id = ?", [userId]);
  await conn.execute("DELETE FROM import_run WHERE user_id = ?", [userId]);

  return { bookmarks: rows.length, urls: urlIds.length, alarms: alarmIds.length };
};

/** The account's categories, by name — reused when they exist, created when they do not. */
const ensureCategories = async (conn, userId) => {
  const [taken] = await conn.query("SELECT name FROM category WHERE user_id <> ? AND name IN (?)", [
    userId,
    CATEGORIES.map((category) => category.name),
  ]);
  if (taken.length > 0) {
    throw new Error(
      `category name(s) ${taken.map((row) => row.name).join(", ")} already belong to another account on this ` +
        "database, whose `category.name` is unique across accounts — rename them in CATEGORIES",
    );
  }

  const ids = new Map();
  for (const category of CATEGORIES) {
    const [[existing]] = await conn.execute("SELECT id FROM category WHERE user_id = ? AND name = ? LIMIT 1", [
      userId,
      category.name,
    ]);
    if (existing) {
      ids.set(category.name, Number(existing.id));
      continue;
    }
    const [created] = await conn.execute("INSERT INTO category (name, color, user_id) VALUES (?, ?, ?)", [
      category.name,
      category.color,
      userId,
    ]);
    ids.set(category.name, Number(created.insertId));
  }
  return ids;
};

const insertRecord = async (conn, userId, categoryIds, record, screenshot) => {
  let alarmId = null;
  if (record.alarm) {
    const [alarm] = await conn.execute("INSERT INTO alarm (frequency, date_added) VALUES (?, ?)", [
      record.alarm.frequency,
      alarmDate(record.alarm, between(0, 3)),
    ]);
    alarmId = alarm.insertId;
  }

  let urlId = null;
  if (record.url) {
    const { normalised, host } = normaliseUrl(record.url);
    const [url] = await conn.execute("INSERT INTO url (original, normalised, host) VALUES (?, ?, ?)", [
      record.url,
      normalised,
      host,
    ]);
    urlId = url.insertId;
  }

  const [bookmark] = await conn.execute(
    `INSERT INTO bookmark (url_id, user_id, alarm_id, title, screenshot, priority, notes, stars, date_added, date_last_modified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      urlId,
      userId,
      alarmId,
      record.title,
      screenshot,
      record.priority === "" ? null : record.priority,
      record.notes,
      record.stars,
      day(record.daysAgo),
      record.modifiedDaysAgo === null ? null : day(record.modifiedDaysAgo),
    ],
  );

  for (const name of record.categories) {
    await conn.execute("INSERT INTO bookmark_category (bookmark_id, category_id) VALUES (?, ?)", [
      bookmark.insertId,
      categoryIds.get(name),
    ]);
  }

  return bookmark.insertId;
};

const main = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("refusing to run with NODE_ENV=production — this fills a dev account with invented data");
  }

  const { wipe, email } = parseArguments(process.argv.slice(2));
  const settings = readConnectionSettings();
  const conn = await mysql.createConnection(settings);

  try {
    const [[user]] = await conn.execute("SELECT id FROM user WHERE email = ? LIMIT 1", [email]);
    if (!user) {
      throw new Error(`no account with email ${email} in ${settings.database}@${settings.host} — see docs/seeding.md`);
    }
    const userId = Number(user.id);
    console.log(`seeding ${email} (id ${userId}) on ${settings.database}@${settings.host}`);

    const shotsDir = path.join(uploadPath, String(userId));

    await conn.beginTransaction();

    if (wipe) {
      const gone = await wipeAccount(conn, userId);
      await rm(shotsDir, { recursive: true, force: true });
      console.log(
        `wiped ${gone.bookmarks} records, ${gone.urls} urls, ${gone.alarms} alarms, the categories, the import runs, the screenshots`,
      );
    } else {
      const [[held]] = await conn.execute("SELECT COUNT(*) AS n FROM bookmark WHERE user_id = ?", [userId]);
      if (Number(held.n) > 0) {
        console.log(`appending to ${held.n} existing records — pass --wipe to rebuild from scratch`);
      }
    }

    await mkdir(shotsDir, { recursive: true });
    const fonts = {
      title: await jimp.loadFont(jimp.FONT_SANS_32_BLACK),
      address: await jimp.loadFont(jimp.FONT_SANS_16_WHITE),
    };

    const categoryIds = await ensureCategories(conn, userId);
    const records = generateRecords();
    const ids = new Map();

    for (const record of records) {
      let screenshot = null;
      if (record.shot) {
        screenshot = `screenshot--user-${userId}-${uuidv1()}.png`;
        await drawScreenshot(fonts, record, path.join(shotsDir, screenshot));
      }
      const id = await insertRecord(conn, userId, categoryIds, record, screenshot);
      if (record.key) ids.set(record.key, id);
    }

    // One import in the past, so the import screen's `last import` line reads as a line and not as
    // the sentence for an account that never imported. The counts are invented like the rest.
    await conn.execute("INSERT INTO import_run (user_id, filename, entries, skipped, ran_at) VALUES (?, ?, ?, ?, ?)", [
      userId,
      "session_buddy_export.txt",
      41,
      3,
      `${day(42)} 10:14:00`,
    ]);

    await conn.commit();

    const [[totals]] = await conn.execute(
      `SELECT COUNT(*) AS records, COUNT(screenshot) AS shots, COUNT(alarm_id) AS alarms, COUNT(notes) AS notes
         FROM bookmark WHERE user_id = ? AND active = 1`,
      [userId],
    );
    const [due] = await conn.execute(
      `SELECT MOD(a.frequency - MOD(DATEDIFF(CURDATE(), a.date_added), a.frequency), a.frequency) AS days_until,
              COUNT(*) AS n
         FROM bookmark b INNER JOIN alarm a ON a.id = b.alarm_id
        WHERE b.user_id = ? AND b.active = 1
        GROUP BY days_until ORDER BY days_until`,
      [userId],
    );

    console.log(
      `\n  ${totals.records} records, ${totals.shots} with a screenshot, ${totals.notes} with a note, ${totals.alarms} armed`,
    );
    console.log(`  alarms by countdown: ${due.map((row) => `${row.days_until}d×${row.n}`).join("  ")}`);
    console.log(`  the record the film opens on: ${ids.get("tidy")} — its url is also on ${ids.get("mirror")}`);
    console.log(`  screenshots in ${shotsDir}`);
  } catch (error) {
    await conn.rollback().catch(() => {});
    throw error;
  } finally {
    await conn.end();
  }
};

main().catch((error) => {
  console.error(`\nseed: ${error.message}`);
  process.exit(1);
});
