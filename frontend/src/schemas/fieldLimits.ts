/**
 * Longueurs maximales des champs texte que l'utilisateur écrit (COS-318). Modèle :
 * `~/dev/pfa/front/src/schemas/fieldLimits.ts`.
 *
 * ⚠️ **Ces valeurs sont déduites, pas lues.** pfa peut adosser sa table à
 * `schema.prisma` et le prouver par un test ; bkmk n'a ni migrations ni DDL versionné,
 * donc rien à confronter. Ce qui suit vient du seul endroit du code qui borne quelque
 * chose (l'import, qui tronque les titres à 120) et de valeurs prudentes ailleurs.
 *
 * Conséquence : ces bornes protègent le **formulaire**, pas la base. Un champ plus long
 * que sa colonne remonte encore aujourd'hui en erreur SQL brute au lieu d'un message de
 * formulaire. DATA 01 (COS-306) doit relire les colonnes réelles et corriger cette table
 * — c'est un rattrapage, pas une vérité acquise.
 */
export const FIELD_LIMITS = {
  /** `bookmark.title` — l'import tronque à 120, seule borne écrite dans le code. */
  title: 120,
  /** `url.original`. Prudent : la limite pratique des navigateurs est bien plus haute. */
  url: 2000,
  /** `bookmark.notes`. */
  notes: 1000,
  /** `category.name` — les chips de l'index. */
  categoryName: 50,
  /** `user.name`. */
  userName: 50,
  /** `user.email`. */
  email: 250,
} as const;
