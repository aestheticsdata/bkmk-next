import { BookmarkEdit } from "@components/bookmarks/edit/BookmarkEdit";

/* The edit route (COS-319), and the half of it that is a screen.
 *
 * ⚠️ **`/bookmarks/edit/<id>` moved here, it did not disappear.** PLAT 01 (COS-314) announced that
 * this route would be deleted once editing became a modal; parallel routes turn that around. Next
 * renders the interception only on a client navigation from inside the application — open the
 * address in a new tab, reload it, or follow a link from outside, and there is no page underneath to
 * lay a modal over. This is what renders then, and it is the same form in a card.
 *
 * The path had to move for the interception to exist at all: an intercepting route mirrors the path
 * it catches, and `/bookmarks/<id>/edit` is the one that sits beside the record it edits.
 *
 * No `Suspense`: nothing under here reads the query string, so nothing opts out of prerendering. */
export default async function BookmarkEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <BookmarkEdit id={id} />;
}
