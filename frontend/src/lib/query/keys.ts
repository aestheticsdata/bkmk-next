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
    /** The chrome's `index NNN` — a one-row request for `total_count` only. */
    count: () => [ROOTS.bookmarks, "count"] as const,
  },
  bookmark: {
    all: [ROOTS.bookmark] as const,
    detail: (id: number | string) => [ROOTS.bookmark, String(id)] as const,
  },
  categories: {
    all: [ROOTS.categories] as const,
    list: () => [ROOTS.categories, "list"] as const,
  },
  reminders: {
    all: [ROOTS.reminders] as const,
  },
} as const;
