"use client";

import { useAuth } from "@auth/context/AuthContext";
import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { AlarmLoadSchema } from "@src/schemas/stats";
import { useQuery } from "@tanstack/react-query";

import type { AlarmLoadDay } from "@src/schemas/stats";

/* `next 14 days · load`, as the server counts it (COS-310).
 *
 * ⚠️ **This replaces an aggregate that was already real, and that is the whole point of the
 * ticket.** UI 08 (COS-304) counted the same alarms in `helpers/alarmLoad.ts`, correctly, because
 * `GET /reminders` returns every armed alarm unpaginated — so the browser held the complete set and
 * a `GROUP BY` would have agreed with it. What it could not survive is that stopping being true: the
 * day the list is paginated, the chart would have gone on rendering fourteen bars while counting
 * one page, which is the failure mode nothing on screen would report.
 *
 * The helper is gone with this hook, and `alarmsToday` with it — it existed only to recover the
 * server's `CURDATE()` by subtracting a countdown from a date, and the server now sends the day.
 *
 * Nothing on screen changes. That was the ticket's own prediction and it is worth keeping in the
 * file: this is a move, so the measure of success is that the chart is identical. */
function useAlarmLoad(): { load: AlarmLoadDay[] | undefined; isLoading: boolean } {
  const { privateRequest } = useRequestHelper();
  const isSignedIn = Boolean(useAuth().user?.id);

  const load = useQuery({
    queryKey: queryKeys.reminders.load(),
    queryFn: async () => {
      const response = await privateRequest("/reminders/load");
      return AlarmLoadSchema.parse(response.data);
    },
    enabled: isSignedIn,
    retry: false,
  });

  return { load: load.data, isLoading: load.isLoading };
}

export { useAlarmLoad };
