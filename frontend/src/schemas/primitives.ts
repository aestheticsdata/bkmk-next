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

/** The four levels of `bookmark.priority`, **ordered from least to most urgent** — the order
 *  `ds/PriorityBars` fills its bars in, and the order a `priority` filter list is normalised into
 *  (COS-299), so two equivalent URLs give one cache entry.
 *
 *  A tuple and not only an enum because the list is also read as values: the filter object carries
 *  `priority[]`. `ds/PriorityBars` keeps its own copy on purpose — a design-system primitive draws
 *  four bars and must not depend on the app's schemas to do it. */
export const PRIORITY_LEVELS = ["low", "medium", "high", "highest"] as const;

export type Priority = (typeof PRIORITY_LEVELS)[number];

/** The `bookmark.priority` column. The four literals are the ones the front writes
 *  (`@helpers/getPriorityNumber`); the column has no constraint, but no other write path
 *  exists. `null` when the user picked nothing. */
export const prioritySchema = z.enum(PRIORITY_LEVELS).nullable();

/** The `bookmark.stars` column. The picker offers 0 to 5; that bound lives on the front,
 *  not in the database, so it is checked here. */
export const starsSchema = z.coerce.number().int().min(0).max(5);

/** A flag in a query string, where every value is a string (COS-299).
 *
 *  ⚠️ **Not `z.coerce.boolean()`**, which is `Boolean(value)` and therefore `true` for the string
 *  `"0"` — every non-empty string is truthy. `?starred=0` and `?screenshot=false` would have turned
 *  those filters **on**, which the QA suite caught. The app only ever writes `1`, so anything else
 *  reads as off, and `true` is accepted because a hand-typed URL is the case this exists for. */
export const queryFlagSchema = z.string().transform((value) => value === "1" || value.toLowerCase() === "true");

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
