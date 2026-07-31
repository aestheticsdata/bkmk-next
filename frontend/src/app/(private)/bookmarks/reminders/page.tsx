import { Alarms } from "@components/reminders/Alarms";

/* The alarms route (COS-304).
 *
 * The frame is above it — `app/(private)/layout.tsx` renders the GRAPHITE shell — so the page is
 * nothing but the screen, and the legacy `shared/Layout` wrapper leaves with it. No `Suspense`
 * either: nothing under here reads the query string, so nothing in the subtree opts out of
 * prerendering.
 *
 * `components/reminders/Reminders.tsx` goes with this ticket, and takes the legacy
 * `components/bookmark/BookmarkDetail.tsx` with it — that grid of cards was its only caller. */
export default function BookmarksRemindersPage() {
  return <Alarms />;
}
