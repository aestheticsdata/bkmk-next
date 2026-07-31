import { BookmarkInsert } from "@components/bookmarks/insert/BookmarkInsert";

/* The insert route (COS-302).
 *
 * The frame is above it — `app/(private)/layout.tsx` renders the GRAPHITE shell — so the page is
 * nothing but the screen. The legacy `shared/Layout` wrapper leaves with it, as it did with the
 * record: `cancel` and `commit` are the command bar now.
 *
 * No `Suspense` either, for the record's reason: nothing under here reads the query string, so
 * nothing in the subtree opts out of prerendering.
 *
 * ⚠️ `components/bookmarks/create/` stays where it is. `/bookmarks/edit/<id>` still mounts that
 * component — it is the same file in its edit mode — and it leaves with UI 10 (COS-319), which is
 * what replaces it. Removing it here would take editing away for a lot. */
export default function BookmarksCreatePage() {
  return <BookmarkInsert />;
}
