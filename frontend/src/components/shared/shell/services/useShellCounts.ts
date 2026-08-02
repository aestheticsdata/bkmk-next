"use client";

import { useAuth } from "@auth/context/AuthContext";
import { QUERY_KEYS, QUERY_OPTIONS } from "@components/bookmarks/config/constants";
import useRequestHelper from "@helpers/useRequestHelper";
import { BookmarkListSchema } from "@src/schemas/bookmarks";
import { ReminderListSchema } from "@src/schemas/reminders";
import { useQuery } from "@tanstack/react-query";

/* The two numbers in the chrome — `index 312` and `alarms 004` — and the only real data
 * the shell fetches. Everything else up there is static copy.
 *
 * **Why a query of its own for the total.** The list's own query is page-scoped
 * (`[bookmarks, <page>]`) and only exists on the index; the counter has to be right on
 * `new`, `import` and `alarms` too. `rows=1` is the cheapest page that still comes back
 * with the total, which the controller computes in a separate `COUNT(DISTINCT b.id)`
 * — so it is the real total, not the size of the page. `page=0` is sent explicitly; the
 * schema defaults it anyway since COS-295 made the controller read the pagination from
 * `req.validated.query`, but saying it costs nothing and the URL then reads as what it is.
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
 * COS-306 did rebuild the response — `total_count` is `total`, and `page` / `pageCount` come
 * with it — and it changed what the list asks for rather than whether a total exists, so this
 * hook survived it as predicted. `?userID=` left both requests in the same change: the scope
 * of either is its session. */
const useShellCounts = (): { bookmarks?: number; reminders?: number; remindersPaused?: number } => {
  const { privateRequest } = useRequestHelper();
  /* Only the gate — see `useBookmarkIndex` (COS-306). Both counters would 401 before the
   * session is up, and would then sit at their error state on a screen with no way to retry. */
  const isSignedIn = Boolean(useAuth().user?.id);

  const bookmarks = useQuery({
    queryKey: [QUERY_KEYS.BOOKMARKS, "count"],
    queryFn: async () => {
      const response = await privateRequest("/bookmarks?rows=1&page=0");
      return BookmarkListSchema.parse(response.data).total;
    },
    enabled: isSignedIn,
    ...QUERY_OPTIONS,
  });

  const reminders = useQuery({
    queryKey: [QUERY_KEYS.REMINDERS],
    queryFn: async () => {
      const response = await privateRequest("/reminders");
      return ReminderListSchema.parse(response.data);
    },
    enabled: isSignedIn,
    ...QUERY_OPTIONS,
  });

  /* Two readings off one list (COS-330). The tab's `alarms NNN` is the length — the screen's whole
     inventory, sleeping rows included, because they are still alarms the account holds. The status
     bar needs the other half: `N armed` said of an alarm whose clock is stopped is false, so it is
     told how many are asleep and subtracts them itself. */
  return {
    bookmarks: bookmarks.data,
    reminders: reminders.data?.length,
    remindersPaused: reminders.data?.filter((reminder) => reminder.alarm_paused_at !== null).length,
  };
};

export default useShellCounts;
