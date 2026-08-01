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
taking the connection:

```js
module.exports = async (conn) => {
  const [rows] = await conn.execute("SELECT id, title FROM bookmark");
  // …
};
```

The `.js` case is not hypothetical: MySQL has no url-decoding function, so the text-normalisation
migration (DATA 07) cannot be a statement.

Each file opens with the ticket it comes from and **what breaks if it has not been run** — that
sentence is what a deploy reads when something answers 500.

## Two things the runner does not do

**It does not wrap a migration in a transaction**, because MySQL will not give it one: DDL commits
implicitly, and an `ALTER TABLE` inside a transaction ends it. The run stops at the first failure
and records nothing for it, so `status` shows exactly how far it got.

**It does not run at boot.** The server starts under pm2 with `watch: true` in dev, where a runner
on that path would apply a schema change on a file save. Migrating is a step of the deploy, beside
restarting the process.
