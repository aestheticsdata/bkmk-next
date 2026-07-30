import { BookmarkIndex } from "@components/bookmarks/BookmarkIndex";
import { Suspense } from "react";

/* The index route (COS-299).
 *
 * The frame is already above this one: `app/(private)/layout.tsx` renders the GRAPHITE shell, so the
 * screen only brings its two cards. The old `shared/Layout` wrapper and its `filters` / `sortbar`
 * flags go with the legacy list — the command bar carries the sort now, and the rail the filters.
 *
 * `Suspense` is required rather than decorative: `BookmarkIndex` reads `useSearchParams`, which opts
 * its subtree out of prerendering, and Next asks for the boundary explicitly. The fallback is `null`
 * because the shell is painted around it already — a spinner inside a frame that is visibly there
 * reads as a fault rather than as loading. */
export default function BookmarksPage() {
  return (
    <Suspense fallback={null}>
      <BookmarkIndex />
    </Suspense>
  );
}
