/**
 * Miroir de `frontend/src/schemas/fieldLimits.ts` (COS-318). Les deux tables doivent
 * bouger ensemble ; il n'y a rien pour le vérifier automatiquement, contrairement à pfa
 * qui adosse la sienne à `schema.prisma`.
 *
 * ⚠️ Comme côté front, ces valeurs sont **déduites, pas lues** : bkmk n'a ni migrations
 * ni DDL versionné. DATA 01 (COS-306) doit les confronter aux colonnes réelles.
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
