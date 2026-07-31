"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { BookmarkDetailResponseSchema } from "@src/schemas/bookmarks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* What the record screen needs from the network (COS-301): one record, and the one write it can
 * perform on itself.
 *
 * Written beside the legacy `components/bookmark/services/useBookmark.ts` rather than replacing it,
 * the same call `useBookmarkIndex` made: that hook mirrored its query into `useState` through an
 * effect, and the reminders screen and the edit form still mounted it. Both are rebuilt — UI 08
 * (COS-304) and UI 10 (COS-319) — and it left with the second. This hook now serves the record
 * screen and the edit form alike.
 *
 * ⚠️ **The endpoint answers with an array.** `getBookmarkController` returns the query result as-is,
 * so a one-row array; the schema validates the array and the hook takes the row. An id that matches
 * nothing gives `[]`, which is not an error — it is a record that is not there, and the screen says
 * so. See `RECORD_TEXT.states.missing`.
 *
 * `invalidation` is deliberately the index's, not a narrower one: deleting from here changes the
 * pages, the chrome's counter, the rail's categories and the alarm list, exactly as deleting from a
 * row does. Anything less leaves the index showing a record that no longer exists. */
function useBookmarkRecord(id: string) {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();

  const record = useQuery({
    queryKey: queryKeys.bookmark.detail(id),
    queryFn: async () => {
      const response = await privateRequest(`/bookmarks/${id}`);
      // The boundary: a validated row leaves this function, not an axios response.
      const rows = BookmarkDetailResponseSchema.parse(response.data);
      return rows[0] ?? null;
    },
    enabled: Boolean(id),
    retry: false,
  });

  const remove = useMutation({
    mutationFn: async () => {
      const response = await privateRequest(`/bookmarks/${id}`, { method: "DELETE" });
      return response.data;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all }),
      ]),
  });

  return {
    record: record.data ?? undefined,
    /** True once the request has answered with no row: a valid id, nothing behind it. */
    missing: record.isSuccess && record.data == null,
    isLoading: record.isLoading,
    isError: record.isError,
    remove,
  };
}

export { useBookmarkRecord };
