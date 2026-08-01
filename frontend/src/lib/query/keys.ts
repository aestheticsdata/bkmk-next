/* The cache keys, in one file (COS-299), on pfa's model.
 *
 * They used to be four bare strings in `@components/bookmarks/config/constants`, spread across
 * whichever hook happened to need one — which is how a mutation ends up invalidating a key that no
 * query uses. Here every key is built by a function, so a caller cannot misspell one, and the shape
 * of a list key (which query string it covers) is visible in a single place.
 *
 * ⚠️ **The first element stays the bare word** — `"bookmarks"`, `"categories"`, `"reminders"`. The
 * legacy hooks still write `[QUERY_KEYS.BOOKMARKS, page]`, and react-query matches keys by prefix:
 * as long as both spell the root the same way, a delete from the GRAPHITE index refreshes the old
 * create screen's cache and vice versa. That compatibility is the point, and it lasts exactly as
 * long as the legacy screens do — the UI lot deletes them one by one. */

const ROOTS = {
  bookmarks: "bookmarks",
  bookmark: "bookmark",
  categories: "categories",
  reminders: "reminders",
} as const;

export const queryKeys = {
  bookmarks: {
    /** Everything about the list: what a mutation invalidates. */
    all: [ROOTS.bookmarks] as const,
    /** One page of the index. `query` is the API query string, so two different filters are two
     *  different entries and going back to a previous page is instant. */
    list: (query: string) => [ROOTS.bookmarks, "list", query] as const,
    /** The chrome's `index NNN` — a one-row request for `total` only. */
    count: () => [ROOTS.bookmarks, "count"] as const,
    /** How many records a *draft* filter would match (COS-300) — the number on the filter modal's
     *  primary button. Its own branch rather than a `list` key: same endpoint, but one row instead of
     *  a page, so it must not be served to the table or serve the table's entry back. */
    filterCount: (query: string) => [ROOTS.bookmarks, "filter-count", query] as const,
    /** The `last import` line of the import screen's right pane (COS-307). Under the bookmarks root
     *  on purpose: an import writes records, so the same invalidation that refreshes the index has to
     *  refresh the line that says an import just happened. */
    lastImport: () => [ROOTS.bookmarks, "last-import"] as const,
    /** Records the index already holds for a draft's url (COS-308) — the create screen's duplicate
     *  warning. Keyed by the url as typed rather than by its normal form: the front does not know the
     *  normalisation (it is the server's helper), and two urls that normalise the same are two cache
     *  entries answering the same thing, which is cheaper than shipping the rule to the browser.
     *  Under the bookmarks root, so committing a record refreshes it. */
    duplicates: (url: string) => [ROOTS.bookmarks, "duplicates", url] as const,
    /** The rail's `storage` block (COS-310) — records held and how many carry a screenshot. Under
     *  the bookmarks root, so creating, importing or deleting a record refreshes it with the same
     *  invalidation that refreshes the list. It is not a `list` key and must not be: the numbers
     *  ignore the query, which is the whole reason they are asked for separately. */
    stats: () => [ROOTS.bookmarks, "stats"] as const,
  },
  bookmark: {
    all: [ROOTS.bookmark] as const,
    detail: (id: number | string) => [ROOTS.bookmark, String(id)] as const,
    /** The record's screenshot (COS-301) — a separate request, and a separate entry: the image is a
     *  base64 data URL of the whole file, so it must not be re-fetched with the record's metadata
     *  and must not be thrown away when that metadata is invalidated. Keyed by filename as well as
     *  by record, so re-capturing a screenshot is a different entry rather than a stale one. */
    screenshot: (id: number | string, filename: string) => [ROOTS.bookmark, String(id), "shot", filename] as const,
  },
  categories: {
    all: [ROOTS.categories] as const,
    list: () => [ROOTS.categories, "list"] as const,
  },
  reminders: {
    all: [ROOTS.reminders] as const,
    /** The fourteen-day chart (COS-310), aggregated by the database rather than counted from the
     *  list. Its own entry under the reminders root: arming or clearing an alarm changes both, and
     *  one invalidation covers them. */
    load: () => [ROOTS.reminders, "load"] as const,
  },
} as const;
