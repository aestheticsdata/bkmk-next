/**
 * Mirror of `frontend/src/schemas/fieldLimits.ts` (COS-318). The two tables must move
 * together; nothing checks that automatically, unlike pfa, which backs its own with
 * `schema.prisma`.
 *
 * These are the real columns, read from `src/db/bkmk.sql` and checked against the running
 * database under COS-298 — not the guesses the first version carried. `userName` and
 * `categoryName` were 50 here and are `VARCHAR(20)` in the schema; the reasoning, and the
 * bcrypt ceiling below, are documented once on the front side.
 */
const FIELD_LIMITS = {
  title: 512,
  url: 2048,
  notes: 1000,
  categoryName: 20,
  userName: 20,
  email: 250,
};

/**
 * The password and the recovery passphrase (COS-298). `max` is bcrypt's: it hashes the first
 * 72 bytes and ignores the rest, so accepting more would be checking part of a secret while
 * implying the whole of it counts.
 */
const SECRET_RULES = {
  passwordMin: 12,
  passphraseMin: 20,
  max: 72,
};

module.exports = { FIELD_LIMITS, SECRET_RULES };
