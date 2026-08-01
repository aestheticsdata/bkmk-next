"use client";

import { useAuth } from "@auth/context/AuthContext";
import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { IndexStatsSchema } from "@src/schemas/stats";
import { useQuery } from "@tanstack/react-query";

import type { IndexStats } from "@src/schemas/stats";

/* The rail's `storage` block (COS-310) — how many records the account holds, and how many carry a
 * screenshot.
 *
 * ⚠️ **A request of its own, and the reason is that these numbers must not move with the query.**
 * The index response already carries a `total`, and reusing it was the tempting shortcut: it is the
 * *filtered* total, so selecting a category would have turned `all 1278` into `all 188` and rewritten
 * the screenshot ratio's denominator at the same time. A block called `storage` that changes when
 * you click a filter is measuring the filter, not the storage.
 *
 * `undefined` while it loads rather than a zero: the rail renders the block only when it has real
 * numbers, on the same rule the block was left out under until now — a `0/0` under a caption is
 * worse than nothing there.
 *
 * The gate is the session, not a parameter — see `useBookmarkIndex` (COS-306). */
function useIndexStats(): { stats: IndexStats | undefined; isLoading: boolean } {
  const { privateRequest } = useRequestHelper();
  const isSignedIn = Boolean(useAuth().user?.id);

  const stats = useQuery({
    queryKey: queryKeys.bookmarks.stats(),
    queryFn: async () => {
      const response = await privateRequest("/bookmarks/stats");
      return IndexStatsSchema.parse(response.data);
    },
    enabled: isSignedIn,
    retry: false,
  });

  return { stats: stats.data, isLoading: stats.isLoading };
}

export { useIndexStats };
