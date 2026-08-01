# Migrations

There is no migration runner. `bkmk.sql` next to this folder is a **creation** script — it
builds an empty database and knows nothing about the one already running. So every schema
change lands in two places:

1. in `bkmk.sql`, so a fresh install is correct;
2. in a dated file here, so an existing database can be brought forward.

Nothing applies these automatically. Run them by hand, in filename order, on each database
that predates them — dev first, production at the deploy that carries the code:

```
mysql -u <user> -p bkmk < src/db/migrations/<file>.sql
```

Each file says which ticket it comes from and what breaks if it has not been run. Adding a
real runner is not on the roadmap: at this size, a folder read in order and a line in the
deploy notes is the whole need, and a runner would bring its own state table to keep in
step.

## Applied

| File | Ticket | Dev | Production |
| --- | --- | --- | --- |
| `2026-07-30-add-user-recovery-passphrase.sql` | COS-298 | ✅ 2026-07-30 | ⬜ pending the first deploy |
| `2026-08-01-add-import-run.sql` | COS-307 | ✅ 2026-08-01 | ⬜ pending the first deploy |
