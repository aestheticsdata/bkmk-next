import { z } from "zod";

/* Primitives shared by the network-boundary schemas (COS-318).
 *
 * Modelled on `~/dev/pfa/front/src/schemas/primitives.ts`. The need is the same — MySQL
 * does not always send a number where the column holds one — but the causes differ, and
 * so do the primitives. In pfa it is Prisma serialising its `Decimal` three different
 * ways; here it is `GROUP_CONCAT`, which aggregates `INT` columns and returns a string. */

/** A MySQL `INT` that may arrive as a number **or** a string, depending on whether it
 *  comes from a column or from a `GROUP_CONCAT`. Always yields a finite number. */
export const numberLikeSchema = z.preprocess(
  (value) => (typeof value === "number" || typeof value === "string" ? value : Number.NaN),
  z.coerce.number().finite(),
);

/** `DATE` columns cross JSON as ISO strings. `coerce.date()` accepts either form and
 *  returns a `Date`, so the app never has to re-parse. */
export const dateLikeSchema = z.coerce.date();

/** The `bookmark.priority` column. The four literals are the ones the front writes
 *  (`@helpers/getPriorityNumber`); the column has no constraint, but no other write path
 *  exists. `null` when the user picked nothing. */
export const prioritySchema = z.enum(["low", "medium", "high", "highest"]).nullable();

/** The `bookmark.stars` column. The picker offers 0 to 5; that bound lives on the front,
 *  not in the database, so it is checked here. */
export const starsSchema = z.coerce.number().int().min(0).max(5);

/* ---------------------------------------------------------------------------
 * Deliberate choices — please don't "fix" them.
 *
 * * Response schemas are **loose about nullability**: `.nullish()` wherever the code does
 *   not prove a column is `NOT NULL`. bkmk has no migrations and no versioned DDL —
 *   `dbinitmysql.js` only opens a connection — so the database itself is the only source
 *   of truth about its columns. Tightening happens against real fixtures, in the DATA
 *   lot, not from memory.
 *
 * * Field names keep their `snake_case`: they come straight from the MySQL columns, which
 *   the controllers return unmapped (`SELECT b.*`). Renaming them front-side would only
 *   paper over the wire format. If that ever changes, it starts from a SQL alias.
 *
 * * Never `.strict()`: zod strips unknown keys by default, so a column added server-side
 *   stays backward-compatible. A strict schema would turn any such addition into a hard
 *   failure.
 * --------------------------------------------------------------------------- */
