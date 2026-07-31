"use client";

import { useAuth } from "@auth/context/AuthContext";
import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { ReminderListSchema } from "@src/schemas/reminders";
import { useQuery } from "@tanstack/react-query";

/* What the alarms screen reads (COS-304): every armed alarm, ordered by how soon it rings.
 *
 * The order is the server's — `ORDER BY alarm_days_until` — and it is not re-sorted here. There is
 * no pagination and no sort control on this screen: the whole list arrives, imminent first, which is
 * the only order the screen has ever wanted.
 *
 * ⚠️ **The key is exactly the shell's** (`["reminders"]`, from `useShellCounts`), and that is
 * deliberate: the chrome's `alarms NNN` and this table are the same request, so opening the screen
 * costs nothing once the shell has loaded it, and every mutation that already invalidates
 * `queryKeys.reminders.all` refreshes both. The two hooks must therefore keep returning the *same*
 * shape — the parsed array — which is why the counter takes its `.length` at the call site rather
 * than in its query function.
 *
 * `userID` in the query string is the client telling the server who it is, which is COS-322's
 * problem and not this ticket's; every list controller still reads it. */
function useAlarms() {
  const { privateRequest } = useRequestHelper();
  const userID = useAuth().user?.id;

  const alarms = useQuery({
    queryKey: queryKeys.reminders.all,
    queryFn: async () => {
      const response = await privateRequest(`/reminders?userID=${userID}`);
      // The boundary: validated reminders leave this function, not an axios response.
      return ReminderListSchema.parse(response.data);
    },
    enabled: Boolean(userID),
  });

  return {
    alarms: alarms.data ?? [],
    isLoading: alarms.isLoading,
    isError: alarms.isError,
  };
}

export { useAlarms };
