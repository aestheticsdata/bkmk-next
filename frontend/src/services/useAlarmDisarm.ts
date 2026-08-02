"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* `done` (COS-330) — the record stops having an alarm at all.
 *
 * ⚠️ **Three invalidations where `snooze` needs one, and the extra two are the point.** `done` is not
 * a state on the alarm, it is the alarm's removal: `bookmark.alarm_id` goes back to `NULL`, so the
 * record screen's `alarm` field, the edit modal's segment, the index's `has alarm` filter and the
 * rail's counters all change with it. The reminders root refreshes the list and the chart, the
 * bookmarks root the index and its counters, and `bookmark.detail` the record itself — which is very
 * likely the screen the user came from.
 *
 * `bookmarkId` travels beside `alarmId` for that last key alone: the route needs only the alarm, and
 * the row is holding both anyway. */
function useAlarmDisarm() {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async ({ alarmId }: { alarmId: number; bookmarkId: number }) => {
      await privateRequest(`/reminders/${alarmId}`, { method: "DELETE" });
    },
    onSuccess: (_data, { bookmarkId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.detail(bookmarkId) }),
      ]),
  });
}

export { useAlarmDisarm };
