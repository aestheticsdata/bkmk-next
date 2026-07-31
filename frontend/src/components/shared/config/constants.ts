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
