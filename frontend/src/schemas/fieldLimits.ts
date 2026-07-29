/**
 * Maximum lengths of the text fields the user writes (COS-318). Modelled on
 * `~/dev/pfa/front/src/schemas/fieldLimits.ts`.
 *
 * ⚠️ **These values are inferred, not read.** pfa can back its table with
 * `schema.prisma` and prove it with a test; bkmk has neither migrations nor versioned
 * DDL, so there is nothing to check against. What follows comes from the only place in
 * the code that bounds anything (the import, which truncates titles at 120) and from
 * cautious guesses elsewhere.
 *
 * The consequence: these bounds protect the **form**, not the database. A field longer
 * than its column still surfaces as a raw SQL error rather than a form message. DATA 01
 * (COS-306) must read the real columns and correct this table — it is a catch-up, not
 * settled fact.
 */
export const FIELD_LIMITS = {
  /** `bookmark.title` — the import truncates at 120, the only bound written in the code. */
  title: 120,
  /** `url.original`. Cautious: the practical browser limit is far higher. */
  url: 2000,
  /** `bookmark.notes`. */
  notes: 1000,
  /** `category.name` — the chips on the index. */
  categoryName: 50,
  /** `user.name`. */
  userName: 50,
  /** `user.email`. */
  email: 250,
} as const;
