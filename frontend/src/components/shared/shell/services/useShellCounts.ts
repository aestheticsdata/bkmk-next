"use client";

import { useUserStore } from "@auth/store/userStore";
import { QUERY_KEYS, QUERY_OPTIONS } from "@components/bookmarks/config/constants";
import useRequestHelper from "@helpers/useRequestHelper";
import { BookmarkListSchema } from "@src/schemas/bookmarks";
import { ReminderListSchema } from "@src/schemas/reminders";
import { useQuery } from "@tanstack/react-query";

import type { UserStore } from "@auth/store/userStore";

/* The two numbers in the chrome — `index 312` and `alarms 004` — and the only real data
 * the shell fetches. Everything else up there is static copy.
 *
 * **Why a query of its own for the total.** The list's own query is page-scoped
 * (`[bookmarks, <page>]`) and only exists on the index; the counter has to be right on
 * `new`, `import` and `alarms` too. `rows=1` is the cheapest page that still comes back
 * with `total_count`, which the controller computes in a separate `COUNT(DISTINCT b.id)`
 * — so it is the real total, not the size of the page. `page=0` is passed explicitly
 * rather than left to the schema's default: the middleware validates into
 * `req.validated`, while the controller still reads `req.query`.
 *
 * **The key is a child of `[bookmarks]` on purpose.** Every existing mutation invalidates
 * that prefix, so creating or deleting a record refreshes this counter with no wiring at
 * all. Reminders reuse the list's exact key, which makes the alarms counter free once the
 * reminders screen has been visited, and vice versa.
 *
 * Keys come from the bookmarks module's `QUERY_KEYS`, not from a `@lib/query/keys.ts`:
 * bkmk has no such file yet and adding a second source of truth for cache keys would
 * defeat the point of having one.
 *
 * COS-306 rebuilds pagination server-side. It changes what the list asks for, not the
 * existence of a total, so this hook survives it. */
const useShellCounts = (): { bookmarks?: number; reminders?: number } => {
  const { privateRequest } = useRequestHelper();
  const userID = useUserStore((state: UserStore) => state.user?.id);

  const bookmarks = useQuery({
    queryKey: [QUERY_KEYS.BOOKMARKS, "count"],
    queryFn: async () => {
      const response = await privateRequest(`/bookmarks?rows=1&page=0&userID=${userID}`);
      return BookmarkListSchema.parse(response.data).total_count;
    },
    enabled: Boolean(userID),
    ...QUERY_OPTIONS,
  });

  const reminders = useQuery({
    queryKey: [QUERY_KEYS.REMINDERS],
    queryFn: async () => {
      const response = await privateRequest(`/reminders?userID=${userID}`);
      return ReminderListSchema.parse(response.data);
    },
    enabled: Boolean(userID),
    ...QUERY_OPTIONS,
  });

  return { bookmarks: bookmarks.data, reminders: reminders.data?.length };
};

export default useShellCounts;
