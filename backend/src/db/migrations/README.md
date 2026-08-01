# Migrations

`bkmk.sql` next to this folder is a **creation** script — it builds an empty database. Every schema
change therefore lands in two places:

1. in `bkmk.sql`, so a fresh install is correct;
2. in a dated file here, so an existing database can be brought forward.

What has changed (COS-332) is the second half: a runner applies these files and a
`schema_migrations` table records which ones ran, so "what is true over there" is a query rather
than an SSH session. The markdown table that used to be kept here by hand is gone with it — it was
the only record, and it was correct only as long as somebody remembered to edit it.

## Running them

```
cd backend
pnpm migrate:status          # what has run, what has not
pnpm migrate                 # apply everything pending, in filename order
```

A `.js` migration can also be **read before it is run**, when it says it knows how:

```
pnpm migrate:dry-run 2026-08-01-decode-text.js
```

It prints what it would write and writes nothing, and it records nothing either — a previewed
migration is still pending. The runner refuses a `.sql` (handing the statements to MySQL *is*
running them) and refuses a `.js` that has not opted in, because a dry run over a file that ignores
the flag is a full apply with a reassuring word in front of it. COS-334 is where this came from: it
rewrites the text of 1 177 values, and a rewrite that size should be readable before it happens.

Settings come from `HOST` / `DB_USER` / `DB_PASSWORD` / `DB` if they are set, and otherwise from
`ecosystem.config.js` — untracked, and the place bkmk keeps its environment. `NODE_ENV=production`
picks `env_production`; anything else, including nothing at all, picks `env_dev`. A runner that
reaches for production because a variable was unset is not a mistake worth making once.

## The two situations that are not "apply everything"

**A database where a migration was applied by hand.** Record it without running it:

```
pnpm migrate:mark 2026-07-30-add-user-recovery-passphrase.sql
```

**A database just created from `bkmk.sql`.** It already carries every change these files describe,
so applying them would fail on a duplicate column. Record them all, running none:

```
pnpm migrate:baseline
```

Production is neither: it has none of these changes, so `pnpm migrate` applies them in order.

## Writing one

A `.sql` file is handed to MySQL whole, several statements and all. A `.js` file exports a function
taking the connection and the run's options:

```js
const migration = async (conn, { dryRun = false } = {}) => {
  const [rows] = await conn.execute("SELECT id, title FROM bookmark");
  // …
};

// Only if it really does read `dryRun` and write nothing when it is set.
migration.dryRun = true;

module.exports = migration;
```

The `.js` case is not hypothetical, and there are two of them. `2026-08-01-add-url-normal-form.js`
was the first: MySQL cannot parse a url — there is no function that reads a host out of one or drops
a `?utm_source=` — so the backfill is the same JavaScript the controllers call, run once over the
table. `2026-08-01-decode-text.js` is the second and the same shape for the same reason, MySQL having
no url decoder either.

**Whether a schema change belongs in `bkmk.sql` too depends on what it is.** Both `.js` migrations so
far touch data as well as columns; `bkmk.sql` describes an empty database, so it carries their
columns and none of their backfill. A migration that only moves data — `2026-08-01-decode-text.js` —
has nothing to add there at all, since there are no rows in a fresh install to decode.

Each file opens with the ticket it comes from and **what breaks if it has not been run** — that
sentence is what a deploy reads when something answers 500.

## Two things the runner does not do

**It does not wrap a migration in a transaction**, because MySQL will not give it one: DDL commits
implicitly, and an `ALTER TABLE` inside a transaction ends it. The run stops at the first failure
and records nothing for it, so `status` shows exactly how far it got.

**It does not run at boot.** The server starts under pm2 with `watch: true` in dev, where a runner
on that path would apply a schema change on a file save. Migrating is a step of the deploy, beside
restarting the process.
