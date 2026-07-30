/**
 * Maximum lengths of the text fields the user writes (COS-318). Modelled on
 * `~/dev/pfa/front/src/schemas/fieldLimits.ts`.
 *
 * **These are the real columns.** The first version of this file said they were guesses,
 * because pfa can back its table with `schema.prisma` and bkmk was thought to have no
 * versioned DDL. It has one: `backend/src/db/bkmk.sql`, the creation script, checked column
 * by column against the running database while COS-298 added `recovery_passphrase` — every
 * width below matches it. That file is the authority; read it rather than guessing.
 *
 * Two of these were **wrong, and wrong in the dangerous direction**: `user.name` and
 * `category.name` are `VARCHAR(20)`, not 50. A 21-character value passed the form and came
 * back as a raw SQL error — exactly what this table exists to prevent. The sign-up path
 * reached it, since it derives the account name from the address.
 *
 * Where a screen wants a tighter rule than its column, it says so at its own boundary: the
 * Session Buddy import truncates titles at 120 whatever `title` allows here.
 */
export const FIELD_LIMITS = {
  /** `bookmark.title` — `VARCHAR(512)`. The import's own rule is 120; that one is the import's. */
  title: 512,
  /** `url.original` — `VARCHAR(2048)`. */
  url: 2048,
  /** `bookmark.notes` — the column is `TEXT` (65 535). 1000 is a form choice: a note field with
   *  no bound at all is its own problem. */
  notes: 1000,
  /** `category.name` — `VARCHAR(20)`. The chips on the index are short by design. */
  categoryName: 20,
  /** `user.name` — `VARCHAR(20)`. */
  userName: 20,
  /** `user.email` — `VARCHAR(250)`. */
  email: 250,
} as const;

/**
 * The two secrets, bounded by **bcrypt** rather than by a column (COS-298). What the database
 * stores is the 60-character hash; what these bound is the input.
 *
 * ⚠️ `max` is 72 because **bcrypt hashes the first 72 bytes and silently ignores the rest**.
 * Accepting a longer passphrase would mean checking part of it while letting its owner believe
 * the whole sentence protects the account. Refusing at 72 says so out loud.
 *
 * Bytes, not characters — an accented or CJK passphrase reaches the ceiling sooner than its
 * length suggests. Bounding length is the conservative side of that: 72 ASCII characters are
 * 72 bytes, and anything heavier is caught earlier than it strictly needs to be, never later.
 *
 * `passphraseMin` is higher than `passwordMin` deliberately. The passphrase is what will let
 * someone reset the password (COS-324), so it must not be the weaker of the two; four words
 * clear 20 characters without being hard to keep.
 *
 * These bound **new** secrets only. Sign-in has no minimum, or an account whose password
 * predates the rule could no longer log in.
 */
export const SECRET_RULES = {
  passwordMin: 12,
  passphraseMin: 20,
  max: 72,
} as const;
