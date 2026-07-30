/* The copy of the index screen (COS-299). Same convention as `@text/shell.ts` and `@text/auth.ts`:
 * the words live here, in English, with no locale segment.
 *
 * ⚠️ **What the handoff writes and this file does not.** `List_Graphite` fills its rail with
 * `all 312`, `dev 188`, `demoscene 041` and a `storage` block reading `shots 84/312 · db 1.4 mb`.
 * Those are mock numbers, and the aggregates behind them — per-category counts, screenshot count,
 * database size — are DATA 05 (COS-310). None of them is written here as a placeholder: the rail
 * shows the categories it really has, and the storage block arrives with the numbers it needs.
 *
 * The handoff's query expression `> tag:demoscene stars:>3` is likewise absent. It implies a query
 * *language*, which the app does not have; `describeQuery` prints the real filter object in the same
 * `key:value` shape instead. */

export const INDEX_TEXT = {
  rail: {
    categories: "index · cat",
    /** The row above the categories: no filter at all. Its count is the list's real total. */
    all: "all",
    scopes: "scopes",
    /** The four coarse cuts. `prio high` covers `high` **and** `highest` — see the controller. */
    starred: "starred",
    alarm: "has alarm",
    shot: "has shot",
    priority: "prio high",
  },

  command: {
    query: "query",
    /** Shown in the query field when nothing is filtered — the index is everything. */
    unfiltered: "the whole index",
    sort: "sort",
    rows: "rows",
    /** The label of the sort control, e.g. `added ▾`. The arrow is the direction, not decoration. */
    descending: "▾",
    ascending: "▴",
  },

  /* ⚠️ **No `id` column, and a `shot` column the handoff does not draw** (owner's call).
   *
   * The mockup opens its table with a 58px `id`, which is a database key on a screen where nothing
   * else is one: it does not help you find a record, and it cannot be sorted by — the backend has no
   * case for it. The legacy list did not show it either.
   *
   * `shot` replaces it, from the legacy list, where "does this record have a screenshot" is a column
   * of its own and a sortable one. The handoff folds that into a glyph beside the title; a column is
   * what makes it scannable down the page, and the sort makes it useful. */
  columns: {
    priority: "pri",
    stars: "stars",
    title: "title / url",
    tags: "tags",
    shot: "shot",
    added: "added",
  },

  /** The sort column, named as the command bar and the pager say it — `added`, not `date`. The keys
   *  are the backend's column names (`getBookmarksController`'s `switch`); the four the table can
   *  reach are first, the rest are reachable from the filter modal (UI 04). */
  sortLabels: {
    date: "added",
    tags: "tags",
    title: "title",
    stars: "stars",
    priority: "pri",
    link: "url",
    notes: "notes",
    screenshot: "shot",
    alarm: "alarm",
  } as Record<string, string>,

  row: {
    open: "open url",
    /** The same slot, on a record that has no url — kept so every row's actions are the same width. */
    noUrl: "no url on this record",
    edit: "edit record",
    remove: "delete record",
    askRemove: "delete?",
    confirm: "confirm",
    cancel: "cancel",
    /** Read out by assistive tech in place of the two glyphs, which are decorative. */
    hasShot: "has a screenshot",
    hasAlarm: "has an alarm",
  },

  pager: {
    previous: "previous page",
    next: "next page",
    page: "page",
    /** The number after the slash is a link, as it was in the legacy pager. */
    lastPage: "last page",
    sortedBy: "sorted by",
  },

  states: {
    loading: "loading the index",
    /** Two different nothings: an empty index, and a filter that matches nothing. */
    empty: "the index is empty",
    noMatch: "no record matches this query",
    error: "could not load the index",
  },
} as const;
