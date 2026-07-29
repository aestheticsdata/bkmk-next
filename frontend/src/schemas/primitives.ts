import { z } from "zod";

/* Primitives partagées par les schémas de la frontière réseau (COS-318).
 *
 * Modèle : `~/dev/pfa/front/src/schemas/primitives.ts`. Le besoin est le même — MySQL
 * ne renvoie pas toujours un nombre là où la colonne en contient un — mais les causes
 * diffèrent, donc les primitives aussi. Chez pfa c'est Prisma qui sérialise ses
 * `Decimal` de trois façons ; ici c'est `GROUP_CONCAT`, qui agrège des `INT` et rend
 * une chaîne. */

/** Un `INT` MySQL qui peut arriver en nombre **ou** en chaîne, selon qu'il vient
 *  d'une colonne ou d'un `GROUP_CONCAT`. Rend toujours un nombre fini. */
export const numberLikeSchema = z.preprocess(
  (value) => (typeof value === "number" || typeof value === "string" ? value : Number.NaN),
  z.coerce.number().finite(),
);

/** Les colonnes `DATE` traversent JSON en chaîne ISO. `coerce.date()` accepte les deux
 *  formes et rend un `Date`, pour que l'app n'ait jamais à re-parser. */
export const dateLikeSchema = z.coerce.date();

/** Colonne `bookmark.priority`. Les quatre littéraux sont ceux que le front écrit
 *  (`@helpers/getPriorityNumber`) ; la colonne n'a aucune contrainte, mais aucun autre
 *  chemin d'écriture n'existe. `null` quand l'utilisateur n'a rien choisi. */
export const prioritySchema = z.enum(["low", "medium", "high", "highest"]).nullable();

/** Colonne `bookmark.stars`. Le sélecteur en propose 0 à 5 ; la borne est côté front,
 *  pas en base, donc on la vérifie ici. */
export const starsSchema = z.coerce.number().int().min(0).max(5);

/* ---------------------------------------------------------------------------
 * Choix délibérés — merci de ne pas les « corriger ».
 *
 * * Les schémas de réponse sont **permissifs sur la nullabilité** : `.nullish()` partout
 *   où le code ne prouve pas qu'une colonne est `NOT NULL`. bkmk n'a ni migrations ni DDL
 *   versionné — `dbinitmysql.js` ouvre juste une connexion — donc la seule source de
 *   vérité sur les colonnes est la base elle-même. Resserrer se fera sur des fixtures
 *   réelles, au lot DATA, pas de mémoire.
 *
 * * Les noms de champs gardent leur `snake_case` : ils viennent directement des colonnes
 *   MySQL, que les contrôleurs renvoient sans mapper (`SELECT b.*`). Les renommer côté
 *   front masquerait le format de transport. Si ça change un jour, ça part d'un alias SQL.
 *
 * * Jamais de `.strict()` : zod retire les clés inconnues par défaut, donc une colonne
 *   ajoutée côté serveur reste rétro-compatible. Un schéma strict transformerait tout
 *   ajout en échec dur.
 * --------------------------------------------------------------------------- */
