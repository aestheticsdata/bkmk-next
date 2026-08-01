#!/usr/bin/env node
/* Every relative `require` resolves, and resolves to a file with that exact spelling (COS-346).
 *
 * ⚠️ **This exists because macOS cannot see the bug it checks for.** `routes/api/bookmarks.js` asked
 * for `getScreenshotController` while the file on disk was `getScreenshotcontroller.js` — a lowercase
 * `c`. APFS is case-insensitive, so it resolved here every time, for three years. ext4 is not, so on
 * the VPS `require` raises `MODULE_NOT_FOUND`; and since that `require` sits at the top of the
 * bookmarks router, which `server.js` mounts at boot, what fails is **the server starting**, not one
 * route answering 500.
 *
 * The front has a gate for this already — a case mismatch fails `next build`, which runs on the way
 * to production. The back is deployed as source and started by pm2, so nothing between a developer's
 * laptop and the VPS ever reads these paths. This script is that missing step, and it is in `lint`
 * so it runs where the rest of the checks do.
 *
 * It only inspects **relative** requires: a package name is resolved by node from `node_modules`,
 * where the spelling is the package's own business.
 */

const fs = require("node:fs");
const path = require("node:path");

const SOURCE = path.join(__dirname, "..", "src");

/** What node would try, in order, for `require("./x")`. */
const CANDIDATES = ["", ".js", ".json", "/index.js"];

/** The name the filesystem actually holds, which on a case-insensitive one is not necessarily the
 *  name that just resolved. Reading the directory is the only way to ask. */
const realName = (file) => {
  const wanted = path.basename(file);
  return fs.readdirSync(path.dirname(file)).find((entry) => entry.toLowerCase() === wanted.toLowerCase());
};

const jsFiles = (dir) => {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") found.push(...jsFiles(full));
    } else if (full.endsWith(".js")) {
      found.push(full);
    }
  }
  return found;
};

const problems = [];
let checked = 0;

for (const file of jsFiles(SOURCE)) {
  const source = fs.readFileSync(file, "utf8");

  for (const match of source.matchAll(/require\(\s*["'](\.[^"']*)["']\s*\)/g)) {
    const specifier = match[1];
    const target = path.resolve(path.dirname(file), specifier);
    checked += 1;

    const resolved = CANDIDATES.map((extension) => target + extension).find((candidate) => fs.existsSync(candidate));

    const where = path.relative(path.join(__dirname, ".."), file);
    if (!resolved) {
      problems.push(`${where}\n    requires ${specifier}, which resolves to nothing`);
      continue;
    }

    const real = realName(resolved);
    if (real !== path.basename(resolved)) {
      problems.push(
        `${where}\n    requires ${specifier}\n    but the file is named ${real} — this resolves on macOS and fails on Linux`,
      );
    }
  }
}

if (problems.length === 0) {
  console.log(`${checked} relative requires, all resolving to a file spelled the same way`);
  process.exit(0);
}

console.error(`${problems.length} of ${checked} relative requires will not resolve on a case-sensitive filesystem:\n`);
for (const problem of problems) console.error(`  ${problem}\n`);
process.exit(1);
