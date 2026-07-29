"use client";

import { cn } from "@lib/utils";

import type * as React from "react";

/* `.gr-seg` — the filter toggle. The whole filter modal is built out of these: stars,
 * priority, reminder, categories, all of them rows of segments.
 *
 * Deliberately **not** `ui/tabs`, which it resembles. A tab picks one of several views
 * and only one can be on; a segment is a checkbox wearing a pill, several are on at once,
 * and it changes a query rather than a view. Building it on Radix Tabs would hand it the
 * wrong keyboard model and the wrong ARIA role.
 *
 * So it is a real `<button>` with `aria-pressed`, which is the toggle-button pattern and
 * gets announced correctly. `on` drives both the visual state and the attribute — passing
 * one without the other is the bug this signature is shaped to prevent. */
function Segment({ className, on = false, ...props }: React.ComponentProps<"button"> & { on?: boolean }) {
  return (
    <button
      type="button"
      data-slot="segment"
      data-state={on ? "on" : "off"}
      aria-pressed={on}
      className={cn(
        "inline-flex h-6 cursor-pointer items-center rounded-lg border px-2.75 text-2xs tracking-wider transition-colors duration-120 outline-none",
        "focus-visible:border-gr-accent focus-visible:ring-3 focus-visible:ring-gr-ring",
        on
          ? "border-gr-teal-border bg-linear-to-b from-gr-teal-from to-gr-teal-to text-gr-teal-fg shadow-gr-1 inset-shadow-gr-hair"
          : "border-gr-border bg-white/18 text-gr-fg-3 hover:bg-white/30 hover:text-gr-fg",
        className,
      )}
      {...props}
    />
  );
}

export { Segment };
