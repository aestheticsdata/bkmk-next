export const ROUTES = {
  bookmarks: { path: "/bookmarks?page=0", label: "Bookmarks" },
  /** ⚠️ **A record's link cannot be built from `bookmarks.path`** (COS-301): that one carries
   *  `?page=0` for the legacy list, so `` `${path}/${id}` `` produces `/bookmarks?page=0/6790` — a
   *  query string with an id inside it, which lands back on the index. Every row of the GRAPHITE
   *  index had that href since COS-299, and it is why the record screen could not be opened from the
   *  list. COS-306 moves pagination to the server and can fold this back into one entry. */
  bookmarksRecord: { path: "/bookmarks", label: "Record" },
  bookmarksCreation: { path: "/bookmarks/create", label: "Create bookmark" },
  bookmarksBatchUpload: { path: "/bookmarks/upload", label: "Bookmarks upload" },
  bookmarksReminders: { path: "/bookmarks/reminders", label: "Reminders" },
  login: { path: "/login", label: "Login" },
  signup: { path: "/signup", label: "Signup" },
  /** Where `forgot key?` goes (COS-324). UI 01 removed a `/forgotPassword` that had no page and no
   *  route behind it; this one has both. */
  recover: { path: "/recover", label: "Recover" },
  about: { path: "/about", label: "A propos" },
};

/** `/bookmarks/<id>/edit` — where editing a record lives since COS-319.
 *
 *  ⚠️ **A function, because `bookmarksEdition` could not survive as a prefix.** It used to be
 *  `/bookmarks/edit` with the id appended; the id is in the *middle* of the address now, and it has
 *  to be, because that is the path an intercepting route can mirror to open the edit modal over
 *  whatever screen you were on. Two callers build this link — the index row's `✎` and the record's
 *  `edit` — and both must produce the identical shape or one of them silently stops being
 *  intercepted and full-page-navigates instead. */
export const editHref = (id: number | string): string => `${ROUTES.bookmarksRecord.path}/${id}/edit`;

/** `/bookmarks/reminders#alarm-<id>` — the alarms screen, landing on this record's row (COS-330).
 *
 *  ⚠️ **A fragment rather than `?focus=`.** It never reaches the server, and `useSearchParams` would
 *  put the alarms screen behind a `Suspense` boundary it does not have — the arrangement the record
 *  route explains, reading its id from `params` so that nothing in its subtree opts out of
 *  prerendering.
 *
 *  ⚠️ **The fragment cannot scroll on its own.** The list arrives from react-query, so at first paint
 *  nothing carries the id and the browser has nothing to aim at. `Alarms` waits for the data and
 *  scrolls itself; this pair exists so that the address and the element cannot drift apart. */
export const alarmHref = (id: number | string): string => `${ROUTES.bookmarksReminders.path}#alarm-${id}`;

/** The `id` an alarms row carries — the other half of `alarmHref`. */
export const alarmRowId = (id: number | string): string => `alarm-${id}`;

export const COLUMN_WIDTH = {
  linkIcon: "w-[20px]",
  title: "w-[400px]",
  stars: "w-[78px]",
  notes: "w-[300px]",
  priority: "w-[80px]",
  categories: "w-[380px]",
  screenshot: "w-[80px]",
  alarm: "w-[70px]",
  dateAdded: "w-[160px]",
};

export const PAGES = {
  BOOKMARKS: "bookmarks",
  PAGINATION: "pagination",
};

/** 22, not the 25 the legacy list asked for (COS-299): the handoff paginates the index at 22 rows and
 *  says so on screen — `rows 001–022 of 312`. The number is the design's, not an arbitrary page size,
 *  and the pager's arithmetic reads it from here. */
export const ROWS_BY_PAGE = 22;

export const FIRST_VISIT = "first_visit";
export const VISITED = "visited";

export const EDITION_TYPES = {
  BOOKMARKS: "bookmarks",
  CATEGORIES: "categories",
};
