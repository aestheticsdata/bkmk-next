"use client";

import { cn } from "@lib/utils";
import { Slot } from "radix-ui";

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
 * one without the other is the bug this signature is shaped to prevent.
 *
 * **`asChild` for the segments that navigate** (COS-299). The index's mobile category scroller is a
 * row of these, and there each one is a filtered *address*: it has to be a link, or middle-click and
 * the back button stop working. The state attribute changes with the element — `aria-pressed` is for
 * a button that toggles, and on a link it would announce a control that does not exist, so a link
 * gets `aria-current` instead.
 *
 * **`action` for the segments that do something and leave** (COS-302). The insert screen's tag row
 * is a third case: clicking a suggestion adds the tag, and the segment is gone from the row on the
 * next render — the selection lives in the field above it, as a token. Announcing that as a toggle
 * button that is "not pressed" describes a state it never reaches. So `action` drops the attribute
 * and leaves a plain button wearing the row's look.
 *
 * Three modes, one rule: the state attribute has to match what the control actually does. */
function Segment({
  className,
  on = false,
  asChild = false,
  action = false,
  ...props
}: React.ComponentProps<"button"> & { on?: boolean; asChild?: boolean; action?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="segment"
      data-state={on ? "on" : "off"}
      {...(asChild
        ? { "aria-current": on ? ("page" as const) : undefined }
        : { type: "button" as const, ...(action ? {} : { "aria-pressed": on }) })}
      className={cn(
        "inline-flex h-6 cursor-pointer items-center rounded-lg border px-3 text-2xs tracking-wider transition-colors duration-120 outline-none",
        "focus-visible:border-gr-accent focus-visible:ring-3 focus-visible:ring-gr-ring",
        /* A drawn-but-inert segment, which the import screen's `on import` row is entirely made of
           (COS-303). The same call the account menu made for its three unbuilt entries: shown, so
           you learn what the screen will do, and greyed, because the one thing worse than a missing
           control is one that does nothing when pressed. */
        "disabled:pointer-events-none disabled:opacity-45",
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
