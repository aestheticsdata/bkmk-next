import { BookmarkImport } from "@components/bookmarks/import/BookmarkImport";

/* The import route (COS-303).
 *
 * The frame is above it — `app/(private)/layout.tsx` renders the GRAPHITE shell — so the page is
 * nothing but the screen, and the legacy `shared/Layout` wrapper leaves with it. No `Suspense`
 * either: nothing under here reads the query string, so nothing in the subtree opts out of
 * prerendering.
 *
 * `components/bookmarks/upload/` goes with this ticket — unlike the create form, nothing else
 * mounted it. */
export default function BookmarksUploadPage() {
  return <BookmarkImport />;
}
