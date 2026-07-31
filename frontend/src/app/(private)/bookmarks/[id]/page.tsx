import { BookmarkRecord } from "@components/bookmark/BookmarkRecord";

/* The record route (COS-301).
 *
 * The frame is above it — `app/(private)/layout.tsx` renders the GRAPHITE shell — so the page only
 * awaits the id and hands it over. The legacy `shared/Layout` wrapper leaves with this screen: its
 * `backButton` / `editButton` / `deleteButton` tool bar is the command bar now.
 *
 * No `Suspense` here, unlike the index: this screen reads its id from `params`, not from the query
 * string, so nothing in the subtree opts out of prerendering. */
export default async function BookmarkRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <BookmarkRecord id={id} />;
}
