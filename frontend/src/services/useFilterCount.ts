"use client";

import { useAuth } from "@auth/context/AuthContext";
import { toApiQuery } from "@components/bookmarks/helpers/indexQuery";
import { useDebouncedValue } from "@helpers/useDebouncedValue";
import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { BookmarkListSchema } from "@src/schemas/bookmarks";
import { useQuery } from "@tanstack/react-query";

import type { FiltersQuery } from "@src/schemas/filters";

/** How long the modal waits after the last keystroke before counting again. Long enough that a word
 *  typed at speed costs one request, short enough that the count feels attached to the field. */
const DEBOUNCE_MS = 300;

/* How many records a draft filter would match, and how long finding out took (COS-300).
 *
 * This is what makes the modal's primary button say `filter — 27 results` before anything is applied:
 * the draft is not in the URL yet, so nothing else on the screen knows about it, and the count has to
 * be asked for on its own.
 *
 * **`rows=1` is the request, not `rows=22`.** The controller computes `total_count` in a separate
 * `COUNT(DISTINCT b.id)` over the same conditions, so one row is the cheapest page that still carries
 * the real total — the same trick `useShellCounts` uses for the chrome's `idx NNN`.
 *
 * **`elapsedMs` is measured here, and it is the footer's `live · N ms`.** The handoff prints a static
 * `4 ms`; a hard-coded latency is a performance claim nobody made. It is the round trip of the request
 * this hook just did, `Math.round`ed, and it is only reported for a count that actually went to the
 * network — a cache hit takes no time and would print `live · 0 ms`, which reads as broken.
 *
 * **The key is a child of `[bookmarks]`**, like every other list key, so a create or a delete
 * invalidates the counts the modal has cached along with everything else. `page` is dropped from the
 * draft before it is turned into a query string: the count is over the whole filter, not over a page
 * of it, and leaving it in would give page 2 of a filter its own cache entry for the same number. */
function useFilterCount(draft: FiltersQuery, { enabled }: { enabled: boolean }) {
  const { privateRequest } = useRequestHelper();
  const userID = useAuth().user?.id;

  const apiQuery = toApiQuery({ ...draft, page: 0 }, { rows: 1, userID });
  // Debounced on the *query string*, not on the title: one timer covers every control, and two
  // drafts that differ only in a cleared-then-retyped word do not even re-fire.
  const settledQuery = useDebouncedValue(apiQuery, DEBOUNCE_MS);

  const count = useQuery({
    queryKey: queryKeys.bookmarks.filterCount(settledQuery),
    queryFn: async () => {
      const startedAt = performance.now();
      const response = await privateRequest(`/bookmarks?${settledQuery}`);
      const elapsedMs = Math.round(performance.now() - startedAt);
      return { total: BookmarkListSchema.parse(response.data).total_count, elapsedMs };
    },
    enabled: enabled && Boolean(userID),
    retry: false,
    /* Keeps the previous count under the button while the next one loads. Without it the button
     * loses its number on every keystroke and flickers between two widths, which on a control
     * labelled `filter — 27 results` is the whole label moving. */
    placeholderData: (previous) => previous,
  });

  return {
    total: count.data?.total,
    elapsedMs: count.data?.elapsedMs,
    /** True while the number under the pointer is not yet the answer to what is on screen. */
    isStale: count.isFetching || settledQuery !== apiQuery,
    isError: count.isError,
  };
}

export { useFilterCount };
