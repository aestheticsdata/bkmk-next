"use client";

import { readIndexQuery } from "@components/bookmarks/helpers/indexQuery";
import { IndexCommandBar } from "@components/bookmarks/IndexCommandBar";
import { IndexFilterModal } from "@components/bookmarks/IndexFilterModal";
import { IndexPager } from "@components/bookmarks/IndexPager";
import { IndexMobileRail, IndexRail } from "@components/bookmarks/IndexRail";
import { IndexTable } from "@components/bookmarks/IndexTable";
import { Card } from "@components/ds/Card";
import { useBookmarkIndex } from "@src/services/useBookmarkIndex";
import { useCategoryList } from "@src/services/useCategoryList";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/* `List_Graphite` — the index (COS-299), and the heaviest screen of the lot.
 *
 * Two cards side by side: the rail at 196px, the table filling the rest, 12px between them. Below
 * `@3xl` the rail is gone and its categories reappear as a scroller at the top of the table card.
 *
 * **The URL is the whole state.** `readIndexQuery` parses the address bar into the filter object and
 * everything below is a function of it — which rows are fetched, which rail row is lit, what the
 * query field reads, which page the pager is on. Nothing is mirrored into a store, so nothing can
 * disagree; the back button undoes a filter; a filtered index can be sent to someone.
 *
 * Two pieces of state are *not* in the URL, and both for the same reason — they are gestures in
 * progress rather than properties of the page, and a reload should not resume either: which row is
 * awaiting delete confirmation, which lives in the table, and whether the filter modal is open,
 * which lives here because two controls open it and neither owns it.
 *
 * `useSearchParams` is why this file is a client component and why the route wraps it in `Suspense`:
 * reading the query string opts the tree out of static prerendering. */
function BookmarkIndex() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = readIndexQuery(searchParams);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { rows, total, pageCount, isLoading, isFetching, isError, remove } = useBookmarkIndex(query);
  const { categories } = useCategoryList();

  /* `⌥F` — the shortcut printed on the filter button (COS-300).
   *
   * ⚠️ **`event.code`, not `event.key`.** On macOS `Alt` is a compose key: `⌥F` produces `ƒ`, so
   * `event.key === "f"` is never true there. `code` is the physical key and is the same on every
   * layout that has one.
   *
   * **It opens and never closes.** The handoff's own control toggles, but the modal contains a text
   * field, and `⌥F` typed into it would throw away a draft in progress. `esc`, the backdrop and the
   * `×` all close, which is three ways too many to need a fourth. `preventDefault` stops the `ƒ`
   * from being inserted anywhere. */
  useEffect(() => {
    const openOnShortcut = (event: KeyboardEvent) => {
      if (!event.altKey || event.metaKey || event.ctrlKey || event.code !== "KeyF") return;
      /* ⚠️ **Not while another dialog is up** (COS-319). This listener is on `window`, so it kept
         firing under the edit modal — which the index now sits beneath rather than navigating away
         from — and opened the filter modal on top of a form, with two focus traps fighting over the
         page. The ticket calls this the mutual exclusion the prototype got from a single piece of
         state; with the edit modal carried by a route, the two surfaces no longer share one, so the
         index asks the DOM instead. It is also correct for the filter modal itself: pressing `⌥F`
         while it is open now does nothing rather than re-opening it. */
      if (document.querySelector("[data-slot=dialog-content]")) return;
      event.preventDefault();
      setFiltersOpen(true);
    };

    window.addEventListener("keydown", openOnShortcut);
    return () => window.removeEventListener("keydown", openOnShortcut);
  }, []);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[--spacing(49)_1fr] gap-3 @max-3xl:grid-cols-1 @max-3xl:gap-2">
      <IndexRail
        categories={categories}
        query={query}
        pathname={pathname}
        total={total}
        className="@max-3xl:hidden"
      />

      <Card className="flex min-h-0 flex-col">
        <IndexMobileRail
          categories={categories}
          query={query}
          pathname={pathname}
          total={total}
        />
        <IndexCommandBar
          query={query}
          pathname={pathname}
          categories={categories}
          shown={rows.length}
          total={total}
          onOpenFilters={() => setFiltersOpen(true)}
        />
        <IndexTable
          rows={rows}
          query={query}
          pathname={pathname}
          total={total}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          remove={remove}
        />
        <IndexPager
          query={query}
          pathname={pathname}
          total={total}
          pageCount={pageCount}
          shown={rows.length}
        />
      </Card>

      {/* Outside the two cards, and it does not matter where: Radix portals it to `document.body`.
          It sits here rather than in the command bar because the shortcut opens it too. */}
      <IndexFilterModal
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        query={query}
        pathname={pathname}
        categories={categories}
      />
    </div>
  );
}

export { BookmarkIndex };
