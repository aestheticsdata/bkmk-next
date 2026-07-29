/**
 * Mirror of `frontend/src/schemas/fieldLimits.ts` (COS-318). The two tables must move
 * together; nothing checks that automatically, unlike pfa, which backs its own with
 * `schema.prisma`.
 *
 * ⚠️ As on the front, these values are **inferred, not read**: bkmk has neither
 * migrations nor versioned DDL. DATA 01 (COS-306) must check them against the real
 * columns.
 */
const FIELD_LIMITS = {
  title: 120,
  url: 2000,
  notes: 1000,
  categoryName: 50,
  userName: 50,
  email: 250,
};

module.exports = { FIELD_LIMITS };
