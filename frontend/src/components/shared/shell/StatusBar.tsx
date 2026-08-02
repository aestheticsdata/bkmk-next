"use client";

import useShellRoute from "@components/shared/shell/helpers/useShellRoute";
import useShellCounts from "@components/shared/shell/services/useShellCounts";
import { SHELL_STATUS, SHELL_TEXT } from "@text/shell";

/* `.gr-bar` — the 26px line under the desk: a state word, the screen's keyboard hints,
 * and one value pushed right.
 *
 * **Its content is per screen, and it is copy**, so it lives in `@text/shell.ts` keyed by
 * screen rather than being passed down. A layout cannot take props from the page it
 * renders, and the alternative — a store the screens write into on mount — would buy a
 * flash of the wrong content and an effect per screen for a table of static strings.
 *
 * The right-hand slot is the exception: two screens compute it from the real counters. It
 * renders nothing at all until the count arrives, rather than a placeholder that would
 * read as a value.
 *
 * Below `@3xl` the hints go — the tab bar takes their room, and a phone has no keyboard to
 * hint at. */
function StatusBar() {
  const { screen, recordId } = useShellRoute();
  const counts = useShellCounts();

  // Widened from the `as const` literal so `right` is uniformly optional: the map only
  // carries one where the value is static.
  const entry: { hints: readonly string[]; right?: string } = SHELL_STATUS[screen];

  /* ⚠️ **`armed` used to name the screen and now names the number**, which is the change: the slot
     said `N armed` about the length of the alarms list, and since COS-330 a row can sit in that list
     with its clock stopped. So the count is the list minus what is asleep, and the sleeping ones get
     a word of their own rather than being quietly counted as armed. */
  const onAlarms = screen === "reminders";
  const paused = counts.remindersPaused ?? 0;
  const count = onAlarms
    ? counts.reminders === undefined
      ? undefined
      : counts.reminders - paused
    : counts.bookmarks;
  const format = onAlarms
    ? (value: string) =>
        paused > 0 ? SHELL_TEXT.status.armedWithPaused(value, String(paused)) : SHELL_TEXT.status.armed(value)
    : SHELL_TEXT.status.index;

  /* Three sources, in order of how specific they are: the record screen names the record it is on
     (COS-301), a screen with a static slot prints it, and everything else falls back to the counter.
     `recordId` is only ever set on that screen, so the first branch cannot leak into another. */
  const right = recordId
    ? SHELL_TEXT.status.record(recordId)
    : (entry.right ?? (count === undefined ? undefined : format(String(count))));

  return (
    <div className="flex h-6.5 shrink-0 items-center gap-4 px-4.5 pb-1 text-3xs uppercase tracking-widest text-gr-fg-4 @max-3xl:h-5 @max-3xl:px-3.5 @max-3xl:pb-0.5">
      <span className="text-gr-accent">{SHELL_TEXT.status.state}</span>
      <div className="flex gap-4 @max-3xl:hidden">
        {entry.hints.map((hint) => (
          <span key={hint}>{hint}</span>
        ))}
      </div>
      {right && <span className="num ml-auto">{right}</span>}
    </div>
  );
}

export { StatusBar };
