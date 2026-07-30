export const ROUTES = {
  bookmarks: { path: "/bookmarks?page=0", label: "Bookmarks" },
  bookmarksCreation: { path: "/bookmarks/create", label: "Create bookmark" },
  bookmarksEdition: { path: "/bookmarks/edit", label: "Edit bookmark" },
  bookmarksBatchUpload: { path: "/bookmarks/upload", label: "Bookmarks upload" },
  bookmarksReminders: { path: "/bookmarks/reminders", label: "Reminders" },
  login: { path: "/login", label: "Login" },
  signup: { path: "/signup", label: "Signup" },
  about: { path: "/about", label: "A propos" },
};

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
