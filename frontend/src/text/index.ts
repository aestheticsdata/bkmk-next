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
    /** The button that opens the filter modal, and the shortcut printed on it in a dimmer ink. */
    filter: "filter",
    filterKey: "⌥F",
    /** Both openings of the modal, for assistive tech: the button says it, and so does the field. */
    openFilters: "open the filters",
  },

  /* The way out of the index (COS-333). The handoff draws no export control anywhere — bkmk could
   * not export at all — so this is placed rather than copied: on the command bar, beside the filter,
   * because that bar is what the index is looked at through.
   *
   * ⚠️ **`the whole index` is a promise, not a caption.** The bar right beside it can carry a filter,
   * and an export that quietly handed you the filtered subset is the one mistake a backup must not
   * make. The menu says which it is before it is opened, not after. */
  export: {
    button: "export",
    caption: "the whole index",
    formats: {
      json: "json · everything",
      csv: "csv · title;url",
      html: "html · for a browser",
    },
    /** While the file is being built and sent. One word: the bar is 26px and the button is a chrome
     *  control, not a progress area. */
    busy: "…",
    failed: "export failed",
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
   *  are the backend's column names (`getBookmarksController`'s `switch`).
   *
   *  ⚠️ **Nine entries, six columns.** `link`, `notes` and `alarm` are sort cases the backend has and
   *  no control on the screen reaches — COS-299 predicted the filter modal would, and it does not:
   *  the handoff's modal filters, it has no sort control, and adding one would put a second way to
   *  sort next to the header row that already does it. They stay labelled because a hand-written
   *  `?sort=notes` is a valid query, and the command bar has to be able to name what it is showing. */
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

  /* The filter modal (COS-300). Seven controls, in the handoff's order.
   *
   * ⚠️ **`live · N ms` is the only number in this file that is measured, and it has to stay that
   * way.** The handoff prints `live · 4 ms`, which is a mock; here it is how long the count request
   * behind `filter — N results` actually took. A static `4 ms` would be a performance claim invented
   * by a designer, which is the one kind of decoration that also misleads. */
  filters: {
    title: "filter",
    /** Beside the title: what kind of filter panel this is, and that the count below is live. */
    mode: "advanced · live",
    /** After the header's `27/1278` — the denominator is the index's real total. */
    match: "match",
    close: "close the filters",

    /* The category picker (owner's call, mid-COS-300). It first drew all fifty-three categories as a
     * scrolling cloud of chips; a token field plus one row of suggestions replaced it. */
    categories: {
      search: "search categories",
      placeholder: "type to search, ↵ to add",
      /** The row under the field, in its two states. */
      mostUsed: "most used",
      matches: "matches",
      noMatch: "no category matches",
      /** Shown when the matches are more than the row holds. */
      more: (rest: number) => `+${rest} more`,
      remove: (name: string) => `remove ${name}`,
    },

    fields: {
      title: "title contains",
      titlePlaceholder: "substring match on title",
      categories: "categories",
      stars: "stars",
      priority: "priority",
      reminder: "reminder",
      contains: "contains",
      /** The read-only line at the bottom: the whole draft, in the command bar's own shorthand. */
      expression: "resolved expression",
    },

    /** `any` is the absence of a filter, so it is a segment like the others but writes nothing. */
    starLevels: {
      any: "any",
      /** `1+` … `4+` are minimums; `5` needs no `+`, there is nothing above it. */
      min: (stars: number) => (stars < 5 ? `${stars}+` : "5"),
    },

    /** The four levels, shortened to the handoff's words, and `—` for a record with no level at all.
     *  `none` is not a value the column holds — see `PRIORITY_FILTER_LEVELS`. */
    priorityLevels: {
      highest: "highest",
      high: "high",
      medium: "med",
      low: "low",
      none: "—",
    } as Record<string, string>,

    /** ⚠️ **`≤ 3d` and the backend's `REMINDER_DUE_DAYS` are one number written twice** — see the
     *  constant in `getBookmarksController`. Same hand-copied arrangement as `FIELD_LIMITS`. */
    reminderStates: {
      any: "any",
      armed: "armed",
      none: "none",
      due: "≤ 3d",
    },

    contains: {
      screenshot: "screenshot",
      notes: "notes",
      url: "url",
    },

    footer: {
      /** The primary action, carrying the live count: `filter — 27 results`. */
      apply: (results: number) => `filter — ${results} ${results === 1 ? "result" : "results"}`,
      /** Shown instead while the count is in flight, so the button never prints a stale number. */
      applyPending: "filter",
      reset: "reset",
      /** The measured round trip of the count request. */
      live: (ms: number) => `live · ${ms} ms`,
    },
  },

  states: {
    loading: "loading the index",
    /** Two different nothings: an empty index, and a filter that matches nothing. */
    empty: "the index is empty",
    noMatch: "no record matches this query",
    error: "could not load the index",
  },
} as const;
