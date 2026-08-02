"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* Putting an alarm to sleep and waking it (COS-330) — the row's `snooze` / `resume`, and the command
 * bar's `snooze all` / `resume all`.
 *
 * ⚠️ **The wanted state is sent, it is not toggled.** The screen reads a list fetched some time ago,
 * so a toggle can be aimed at a state that has already moved — you see `snooze`, another tab woke
 * the alarm, and the click puts it back to sleep. Both hooks therefore take `paused`, and the caller
 * reads it off the row in front of it.
 *
 * ⚠️ **One invalidation covers both entries.** `queryKeys.reminders.load()` is a child of
 * `queryKeys.reminders.all` and react-query matches keys by prefix, so invalidating the root
 * refreshes the list, the fourteen-day chart and the chrome's counter in a single call. The
 * bookmarks root is deliberately left alone: a sleeping alarm is still an alarm as far as
 * `bookmark.alarm_id` is concerned, so nothing the index or the record reads has moved. `done` is
 * the one that touches it — see `useAlarmDisarm`. */
function useAlarmPause() {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async ({ alarmId, paused }: { alarmId: number; paused: boolean }) => {
      await privateRequest(`/reminders/${alarmId}`, { method: "PATCH", data: { paused } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all }),
  });
}

/** `snooze all` / `resume all` — the same write with no identifier, so the server moves the whole
 *  account in one statement.
 *
 *  ⚠️ **Not a loop over the list the browser is holding.** Waking subtracts the day an alarm fell
 *  asleep from today, so alarms sent one by one over a slow connection could fall asleep on two
 *  different days and wake up on two different series. */
function useAlarmsPause() {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async ({ paused }: { paused: boolean }) => {
      await privateRequest("/reminders", { method: "PATCH", data: { paused } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all }),
  });
}

export { useAlarmPause, useAlarmsPause };
