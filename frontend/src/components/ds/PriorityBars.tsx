import { cn } from "@lib/utils";

import type * as React from "react";

/* `GPri` — priority as a bar gauge, same trick as the stars: all the bars are drawn, the
 * unearned ones dimmed, so the column stays a column.
 *
 * ⚠️ **Four levels, not the handoff's three.** The mockup shows `high / med / low` and
 * three bars; bkmk's data has four — `low`, `medium`, `high`, `highest` — which is what
 * `schemas/primitives.ts` validates and what the database stores. The schema wins: a
 * three-bar gauge could not tell `high` from `highest`, and the redesign is not allowed
 * to quietly drop a value users already set.
 *
 * The empty string is a real state, not a missing one: the create form sends `priority`
 * unset that way and the backend tests `!== ""`. It renders as four dim bars — present,
 * unranked — rather than as nothing, which would leave a hole in the column.
 *
 * COS-412 replaces the two-tone `--fg-2`/`--fg-3` split (which only ever told `highest`
 * apart from the rest) with a fixed gradient across bar *position* — `--gr-pri-1..4`,
 * lightest to darkest left to right — so a filled bar keeps the tone of its slot instead
 * of the whole run taking one color for the row's level. */
const PRIORITY_LEVELS = ["low", "medium", "high", "highest"] as const;

type Priority = (typeof PRIORITY_LEVELS)[number] | "";

const BAR_COLOR = ["text-gr-pri-1", "text-gr-pri-2", "text-gr-pri-3", "text-gr-pri-4"];

function PriorityBars({ p, className, ...props }: React.ComponentProps<"span"> & { p: Priority }) {
  const filled = p === "" ? 0 : PRIORITY_LEVELS.indexOf(p) + 1;
  return (
    <span
      data-slot="priority-bars"
      role="img"
      aria-label={p === "" ? "no priority" : `priority ${p}`}
      className={cn("whitespace-nowrap tracking-tighter", className)}
      {...props}
    >
      {PRIORITY_LEVELS.map((level, index) => (
        <span
          key={level}
          aria-hidden
          className={index < filled ? BAR_COLOR[index] : "text-gr-fg-4 opacity-40"}
        >
          ▮
        </span>
      ))}
    </span>
  );
}

export { PRIORITY_LEVELS, PriorityBars };

export type { Priority };
