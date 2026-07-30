"use client";

import { useAuth } from "@auth/context/AuthContext";
import { toApiQuery } from "@components/bookmarks/helpers/indexQuery";
import { ROWS_BY_PAGE } from "@components/shared/config/constants";
import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { BookmarkListSchema } from "@src/schemas/bookmarks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { FiltersQuery } from "@src/schemas/filters";

/* What the index screen needs from the network (COS-299): one page of rows, and the one mutation a
 * row can perform on its own.
 *
 * Written beside the legacy `components/bookmarks/services/useBookmarks.ts` rather than on top of
 * it. That hook carries page number in `useState`, three `useEffect`s that re-derive it from
 * `window.location.search`, a zustand store remembering the last page, and the create / edit /
 * upload mutations with their redirects — all of which the screens the UI lot has not rebuilt still
 * depend on. Rewriting it under them would break four screens to deliver one.
 *
 * So this one is deliberately small, and the difference is the point: **the URL is the state.**
 * `query` comes in already parsed from the address bar, so there is nothing to keep in sync, no
 * effect chain, and a page change is a navigation like any other.
 *
 * The keys come from `@lib/query/keys` and keep the legacy root word, so invalidation still crosses
 * between old screens and this one — see the warning in that file. */
function useBookmarkIndex(query: FiltersQuery) {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();
  const userID = useAuth().user?.id;

  const apiQuery = toApiQuery(query, { rows: ROWS_BY_PAGE, userID });

  const list = useQuery({
    queryKey: queryKeys.bookmarks.list(apiQuery),
    queryFn: async () => {
      const response = await privateRequest(`/bookmarks?${apiQuery}`);
      // The boundary: a validated page leaves this function, not an axios response.
      return BookmarkListSchema.parse(response.data);
    },
    enabled: Boolean(userID),
    retry: false,
    /* Keeps the previous page on screen while the next one loads, so paging through the index does
     * not blink an empty table between two full ones. The rows are stale for as long as the request
     * takes and that is visible — `isFetching` dims the table. */
    placeholderData: (previous) => previous,
  });

  /** Everything a write can affect: the pages, the chrome's count, the rail's categories, and the
   *  alarm list. One place, so a mutation added later cannot forget half of them. */
  const invalidation = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all }),
    ]);

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const response = await privateRequest(`/bookmarks/${id}`, { method: "DELETE" });
      return response.data;
    },
    onSuccess: invalidation,
  });

  return {
    rows: list.data?.rows ?? [],
    total: list.data?.total_count,
    isLoading: list.isLoading,
    isFetching: list.isFetching,
    isError: list.isError,
    remove,
  };
}

export { useBookmarkIndex };
