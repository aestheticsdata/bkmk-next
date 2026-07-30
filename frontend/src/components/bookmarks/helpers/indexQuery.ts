import { FiltersQuerySchema } from "@src/schemas/filters";
import { PRIORITY_LEVELS } from "@src/schemas/primitives";

import type { FiltersQuery } from "@src/schemas/filters";
import type { Priority } from "@src/schemas/primitives";

/* The index's query, in its three forms (COS-299).
 *
 * The URL is the state. There is no store: the rail writes `?categories_id=3&starred=1`, the pager
 * writes `?page=2`, the column headers write `?sort=-date`, and the list is whatever the address
 * bar says. Which means the back button works, a filtered index can be bookmarked or sent to
 * yourself, and two components never disagree about what is being shown.
 *
 * So this file is the only place that knows how to move between the three forms that state takes:
 *
 * 1. the **URL** — `?page=2&categories_id=3&starred=1`, all strings, written by the screen;
 * 2. the **API query** — the same thing plus `rows` and `userID`, sent to `GET /bookmarks`;
 * 3. the **expression** — `cat:3 starred` shown in the command bar, for a human to read.
 *
 * `queryString` is already a dependency (the legacy hook uses it), but it is not used here:
 * `URLSearchParams` builds and orders the same string, and ordering matters — see `toApiQuery`. */

/** What the index is sorted by when the URL says nothing: newest first.
 *
 *  The backend's own default is no `ORDER BY` at all, which means "whatever the storage engine
 *  hands back" — stable enough to look deliberate and arbitrary enough to be wrong. An index of
 *  things you saved wants the last thing you saved at the top, and the handoff agrees: its pager
 *  reads `sorted by added ▾`.
 *
 *  It stays out of the URL. A default that writes itself into the address bar makes every clean link
 *  grow a parameter, and `?sort=-date` and no sort at all would then be two cache entries for one
 *  page. */
const DEFAULT_SORT = "-date";

/** Reads the URL as the filter object, dropping anything malformed rather than failing the page.
 *  `FiltersQuerySchema` does the coercing; this only hands it the entries. */
function readIndexQuery(searchParams: URLSearchParams | { toString: () => string }): FiltersQuery {
  const entries = Object.fromEntries(new URLSearchParams(searchParams.toString()).entries());
  return FiltersQuerySchema.parse(entries);
}

/** The API query string, **with its keys sorted**.
 *
 *  Sorted because this string is part of the cache key (`queryKeys.bookmarks.list`). Unsorted,
 *  `?starred=1&page=0` and `?page=0&starred=1` describe one page and would occupy two cache
 *  entries — the second arriving as a loading state for something already held.
 *
 *  `userID` is a parameter because every list controller still scopes on it; it is the client's
 *  word for who it is, which is COS-322's subject, not this screen's. */
function toApiQuery(query: FiltersQuery, { rows, userID }: { rows: number; userID?: number }): string {
  const params = new URLSearchParams();

  params.set("rows", String(rows));
  params.set("page", String(query.page));
  if (userID != null) params.set("userID", String(userID));

  if (query.title) params.set("title", query.title);
  params.set("sort", query.sort ?? DEFAULT_SORT);
  if (query.stars != null) params.set("stars", String(query.stars));
  if (query.reminder != null) params.set("reminder", String(query.reminder));
  if (query.categories_id?.length) params.set("categories_id", query.categories_id.join(","));

  // The backend reads presence, so a false flag is an absent parameter, never `0`.
  if (query.screenshot) params.set("screenshot", "1");
  if (query.url) params.set("url", "1");
  if (query.notes) params.set("notes", "1");
  if (query.starred) params.set("starred", "1");
  if (query.alarm) params.set("alarm", "1");
  if (query.priority?.length) params.set("priority", sortLevels(query.priority).join(","));

  params.sort();
  return params.toString();
}

/** Normalises a level list into the palette's order, so `high,highest` and `highest,high` are one
 *  URL and one cache entry. */
function sortLevels(levels: readonly Priority[]): Priority[] {
  return PRIORITY_LEVELS.filter((level) => levels.includes(level));
}

/** True when something other than the category selection is narrowing the list.
 *
 *  The rail needs it to know whether the one number it has — the current query's `total_count` — can be
 *  attributed to a row: with a scope on, the total describes the scope, not the category. */
function hasScopeFilters(query: FiltersQuery): boolean {
  return Boolean(
    query.title ||
      query.stars != null ||
      query.reminder != null ||
      query.starred ||
      query.alarm ||
      query.screenshot ||
      query.url ||
      query.notes ||
      query.priority?.length,
  );
}

/** True when any filter at all is on — what tells "the index is empty" from "nothing matches". */
function isFiltered(query: FiltersQuery): boolean {
  return hasScopeFilters(query) || Boolean(query.categories_id?.length);
}

/** The rail row the current total belongs to, if any (COS-299).
 *
 *  ⚠️ There is exactly **one** count available — `total_count` for the query on screen — and it is not
 *  `all`'s. Pinning it to `all` regardless is the bug this exists to prevent: selecting `hebergeur`
 *  showed `all 002`, which reads as an index of two records.
 *
 *  So the number is shown against the row that *is* the query, and nowhere otherwise: `all` when
 *  nothing is filtered, a category when it is the only thing filtered. Two categories, or a category
 *  plus a scope, describe no single row — the column stays empty until DATA 05 (COS-310) counts each
 *  category for real. */
function countedRow(query: FiltersQuery): { kind: "all" } | { kind: "category"; id: number } | undefined {
  if (hasScopeFilters(query)) return undefined;

  const categories = query.categories_id ?? [];
  if (categories.length === 0) return { kind: "all" };
  if (categories.length === 1) return { kind: "category", id: categories[0] };
  return undefined;
}

/** The expression under `query` in the command bar.
 *
 *  The handoff writes `> tag:demoscene stars:>3`, which is a *language* — one the app does not have
 *  and this ticket is not the place to invent. What it does have is a filter object, so this reads
 *  it out in the same shape: `key:value` pairs, bare words for the flags, in a fixed order so the
 *  line does not reshuffle as filters are toggled.
 *
 *  Categories are named, not numbered, when the caller can resolve them — a rail row says
 *  `dev`, so the expression should too. */
function describeQuery(query: FiltersQuery, categoryNames?: Map<number, string>): string {
  const terms: string[] = [];

  if (query.title) terms.push(`title:${query.title}`);
  for (const id of query.categories_id ?? []) terms.push(`cat:${categoryNames?.get(id) ?? id}`);
  if (query.stars != null) terms.push(`stars:${query.stars}`);
  if (query.starred) terms.push("starred");
  if (query.priority?.length) terms.push(`prio:${sortLevels(query.priority).join("|")}`);
  if (query.reminder != null) terms.push(`every:${query.reminder}d`);
  if (query.alarm) terms.push("alarm");
  if (query.screenshot) terms.push("shot");
  if (query.url) terms.push("url");
  if (query.notes) terms.push("notes");

  return terms.join(" ");
}

/** The URL for a changed query: the current one, patched, with `page` back to 0 unless the patch
 *  is the page itself.
 *
 *  Resetting the page is not a nicety. Page 3 of 77 filtered down to 12 rows is an empty table with
 *  no explanation — the rows exist, they are just before where you are looking. */
function toIndexHref(pathname: string, query: FiltersQuery, patch: Partial<FiltersQuery>): string {
  const next: FiltersQuery = { ...query, ...patch, page: patch.page ?? 0 };
  const params = new URLSearchParams();

  if (next.page > 0) params.set("page", String(next.page));
  if (next.title) params.set("title", next.title);
  if (next.sort) params.set("sort", next.sort);
  if (next.stars != null) params.set("stars", String(next.stars));
  if (next.reminder != null) params.set("reminder", String(next.reminder));
  if (next.categories_id?.length) params.set("categories_id", next.categories_id.join(","));
  if (next.screenshot) params.set("screenshot", "1");
  if (next.url) params.set("url", "1");
  if (next.notes) params.set("notes", "1");
  if (next.starred) params.set("starred", "1");
  if (next.alarm) params.set("alarm", "1");
  if (next.priority?.length) params.set("priority", sortLevels(next.priority).join(","));

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

/** `?sort=` for a header click: the same column flips direction, a new column starts descending.
 *
 *  Descending first because every sortable column here answers "which are the most —" rather than
 *  "which are the least": the newest, the highest rated, the most urgent. */
function nextSort(current: FiltersQuery["sort"], column: string): string {
  return readSort(current).descending && readSort(current).column === column ? column : `-${column}`;
}

/** The active sort, split into the two things a header and the pager both need to show: which column,
 *  and which way. Resolves the default, so no caller has to know what it is. */
function readSort(sort: FiltersQuery["sort"]): { column: string; descending: boolean } {
  const active = sort ?? DEFAULT_SORT;
  return active.startsWith("-") ? { column: active.slice(1), descending: true } : { column: active, descending: false };
}

export {
  countedRow,
  DEFAULT_SORT,
  describeQuery,
  hasScopeFilters,
  isFiltered,
  nextSort,
  readIndexQuery,
  readSort,
  sortLevels,
  toApiQuery,
  toIndexHref,
};
