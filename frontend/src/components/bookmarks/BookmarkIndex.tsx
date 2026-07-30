"use client";

import { readIndexQuery } from "@components/bookmarks/helpers/indexQuery";
import { IndexCommandBar } from "@components/bookmarks/IndexCommandBar";
import { IndexPager } from "@components/bookmarks/IndexPager";
import { IndexMobileRail, IndexRail } from "@components/bookmarks/IndexRail";
import { IndexTable } from "@components/bookmarks/IndexTable";
import { Card } from "@components/ds/Card";
import { useBookmarkIndex } from "@src/services/useBookmarkIndex";
import { useCategoryList } from "@src/services/useCategoryList";
import { usePathname, useSearchParams } from "next/navigation";

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
 * The one piece of state that is *not* in the URL is which row is awaiting delete confirmation, and
 * it lives in the table. It is not a property of the page — it is a gesture in progress, and a
 * reload should not resume it.
 *
 * `useSearchParams` is why this file is a client component and why the route wraps it in `Suspense`:
 * reading the query string opts the tree out of static prerendering. */
function BookmarkIndex() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = readIndexQuery(searchParams);

  const { rows, total, isLoading, isFetching, isError, remove } = useBookmarkIndex(query);
  const { categories } = useCategoryList();

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
          shown={rows.length}
        />
      </Card>
    </div>
  );
}

export { BookmarkIndex };
