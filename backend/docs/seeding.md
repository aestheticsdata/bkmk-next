# Seeding guide — `scripts/seed.js`

Invented data for the house dev account **`local.dev@mock.io`** (BMK-72): eight categories, three
hundred-odd records with stars, priorities and notes spread out, a handful of screenshots the script
draws itself, a dozen armed alarms at every frequency the form offers, one url present twice. It is
what the portfolio film (`frontend/e2e/demo/`) is shot on, so **nothing in it is real** — every host
is under the reserved `.example` domain, every title comes from a word list.

## Command

```bash
cd backend
pnpm seed -- [--wipe] [--email <address>]
```

> The `--` is required so pnpm forwards the flags to the script.

| Option    | Description                                                                              |
| --------- | ---------------------------------------------------------------------------------------- |
| `--wipe`  | Empty the account first, then rebuild. Destructive — see below. Omit it to append.       |
| `--email` | Another account than `local.dev@mock.io`. It has to exist; the script never creates one. |

Bad arguments print the usage and exit without touching the database. `NODE_ENV=production` is
refused outright: this fills a dev account.

## Two modes

**Append (default).** The whole set is added to whatever the account holds; categories are reused by
name, so a second run does not double the rail, but it does double the records — two runs are two
copies of the same three hundred titles, suffixed to stay unique. Fine for topping up an account you
also use by hand; not what you want before a take.

**`--wipe`.** Everything the account holds goes first — records, their urls and alarms, the
categories, the import runs, and the screenshot files under `frontend/public/screenshotsUpload/<id>/`
— then the set is written from scratch. The user row itself is never touched. ⚠️ It clears the
**entire** account, including anything entered through the app.

The generator is seeded, so two `--wipe` runs produce the same records. Only the dates move.

## The dates, and why the seeder is run on the day of a take

An alarm has no next-fire column. It repeats every `frequency` days from `date_added`, and the alarms
screen, the `≤ 3d` filter and the fourteen-day chart all compute the countdown against the server's
`CURDATE()`. So the seeder writes `date_added` **relative to today**: an alarm meant to ring in two
days is armed `frequency − 2` days ago (plus a few whole periods, so it looks older). Run it again on
the day of filming — a set seeded last week has drifted by a week, and a `T-02d` becomes a `T-00d`
that has already rung.

Records are dated over the last three years, mostly recent. The record the film opens on (`Keeping a
tidy index: a field guide`) is dated today, so it sits on the first page of the index whatever the
sort; its url is also on a second record, which is what the insert screen's duplicates panel counts.

## Before a take

The film writes into the account — a record, an imported batch, an edited record — and every take
stacks one more of each (`frontend/e2e/demo/README.md`). The reset is the rebuild:

```bash
cd backend && pnpm seed -- --wipe
```

## The account

The seeder fills an existing account and refuses to run when the email is unknown. On this machine
the house account is the old throwaway row renamed **in place** — same id, its records kept — which
is the one-off to repeat if the database is ever rebuilt from `bkmk.sql`:

```sql
UPDATE user
   SET name = 'local.dev',
       email = 'local.dev@mock.io',
       password = '<bcryptjs hash of azertyazerty, cost 10>',
       recovery_passphrase = '<bcryptjs hash of mock local recovery, cost 10>'
 WHERE id = <the row to rename>;
```

`bcryptjs` is a dependency of the API, so the two hashes are one `node -e` away. The alternative is
the app's own `/signup` — which needs `SIGNUPS_ENABLED` not set to `"false"` in
`ecosystem.config.js`, since sign-ups are closed by default (COS-416). The credentials and the other
local accounts are listed in `ACCOUNTS.md` at the repo root, untracked.

## Reading what is there

```sql
SELECT COUNT(*) AS records, COUNT(screenshot) AS shots, COUNT(alarm_id) AS armed
  FROM bookmark
 WHERE user_id = (SELECT id FROM user WHERE email = 'local.dev@mock.io') AND active = 1;

-- what rings when, the way the screens compute it
SELECT b.title, a.frequency,
       MOD(a.frequency - MOD(DATEDIFF(CURDATE(), a.date_added), a.frequency), a.frequency) AS days_until
  FROM bookmark b INNER JOIN alarm a ON a.id = b.alarm_id
 WHERE b.user_id = (SELECT id FROM user WHERE email = 'local.dev@mock.io') AND b.active = 1
 ORDER BY days_until;
```

The script prints the same two readings when it finishes.

## Prerequisites

- A reachable MySQL. The settings come from `HOST` / `DB_USER` / `DB_PASSWORD` / `DB` when they are
  set, and otherwise from `ecosystem.config.js` beside `package.json` — `env_dev` unless
  `NODE_ENV=production`, which the seeder refuses anyway. `src/db/connectionSettings.js` is the reader,
  shared with the migration runner.
- The schema at the current migration (`pnpm migrate:status`): the seeder writes `url.normalised`,
  `alarm.paused_at` and `import_run`.
- The screenshots land where the API reads them in development,
  `frontend/public/screenshotsUpload/<user id>/`, which is gitignored.
