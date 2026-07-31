"use client";

import { Overline } from "@components/ds/Overline";
import { ALARM_COLUMNS, AlarmsRow } from "@components/reminders/AlarmsRow";
import { cn } from "@lib/utils";
import { ALARMS_TEXT } from "@text/alarms";

import type { Reminder } from "@src/schemas/reminders";

/** The header cells, in grid order. **None of them sorts**, unlike the index's: the list arrives in
 *  the one order this screen is about — soonest first, from the server's `ORDER BY alarm_days_until`
 *  — and a header that reorders by title would be a way of hiding what is imminent. */
const HEADERS: { key: keyof typeof ALARMS_TEXT.columns; className?: string }[] = [
  { key: "title", className: "pl-4 @max-3xl:pl-0" },
  { key: "countdown" },
  { key: "fires" },
  { key: "added", className: "@max-3xl:hidden" },
  { key: "act", className: "justify-end pr-4 @max-3xl:hidden" },
];

/* The alarms table (COS-304): the header row, the rows, and the three things that can be there
 * instead.
 *
 * ARIA table roles over a CSS grid, the index table's arrangement and for its reason: five columns
 * that line up across a scroll container is what a `<table>` cannot do without a fight — a scrolling
 * `<tbody>` needs `display: block`, and that is exactly what stops it agreeing with its `<thead>`.
 * So the structure is divs and the semantics are put back by hand. `biome.json` turns
 * `useSemanticElements` and `useFocusableInteractive` off for this file, the index's and the import
 * staging's, which are the only places that exemption is granted. */
function AlarmsTable({
  alarms,
  isLoading,
  isError,
}: {
  alarms: Reminder[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <div
      role="table"
      aria-label={ALARMS_TEXT.aria.table}
      aria-rowcount={alarms.length}
      className="flex min-h-0 flex-1 flex-col"
    >
      {/* ⚠️ **`@max-3xl:px-3` mirrors the row's own**, and it is a fix rather than symmetry: above the
          fold the left margin is the title cell's `pl-4` and the right one the act cell's `pr-4`, and
          both of those cells change below it — the first loses its padding, the second is hidden
          entirely. Without this the header sat flush to both edges while the rows were inset 12,
          which put `TITLE` 12px left of every title under it and clipped `FIRES` against the card. */}
      <div
        role="row"
        className={cn(
          "grid h-7 shrink-0 items-center border-b border-gr-border-2 bg-gr-panel-2 @max-3xl:px-3",
          ALARM_COLUMNS,
        )}
      >
        {HEADERS.map((header) => (
          <Overline
            key={header.key}
            role="columnheader"
            className={cn("flex items-center", header.className)}
          >
            {ALARMS_TEXT.columns[header.key]}
          </Overline>
        ))}
      </div>

      {/* The card's own scroller. The load chart under it is pinned, so a long list never pushes it
          off the desk — reading how busy the fortnight is must not require scrolling past the alarms
          that make it busy. */}
      <div
        role="rowgroup"
        className="gr-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        {isLoading ? (
          <Placeholder>{ALARMS_TEXT.states.loading}</Placeholder>
        ) : isError ? (
          <Placeholder tone="danger">{ALARMS_TEXT.states.error}</Placeholder>
        ) : alarms.length === 0 ? (
          <Placeholder>{ALARMS_TEXT.states.empty}</Placeholder>
        ) : (
          alarms.map((alarm) => (
            <AlarmsRow
              key={alarm.alarm_id}
              alarm={alarm}
            />
          ))
        )}
      </div>
    </div>
  );
}

/** Loading, empty and failed all read the same way, as they do on the index: one line, centred, in
 *  the tertiary ink. */
function Placeholder({ children, tone }: { children: string; tone?: "danger" }) {
  return (
    <div
      role="row"
      className="flex h-20 items-center justify-center"
    >
      <Overline
        role="cell"
        className={tone === "danger" ? "text-gr-accent-2" : undefined}
      >
        {children}
      </Overline>
    </div>
  );
}

export { AlarmsTable };
