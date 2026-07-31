"use client";

import { Overline } from "@components/ds/Overline";
import { cn } from "@lib/utils";
import { useId } from "react";

import type * as React from "react";

/* A labelled group of controls — `Field`'s sibling for everything that is not an input.
 *
 * It lays its header and its contents out exactly like `Field` does, so that a `Field` and a
 * `FieldGroup` beside each other put their labels **and** their controls on the same two lines:
 * `h-4 leading-4` for the same reason it is load-bearing there, and `gap-1.5` between the two rows.
 *
 * It was born as a local `Group` inside the filter modal (COS-300) and moved here when the insert
 * screen turned out to be made of the same thing — six of its seven fields are a caption over a row
 * of segments, chips or stars, and the edit modal (COS-319) repeats all six. A second private copy
 * was the alternative, and two copies of a component whose whole job is to keep two columns aligned
 * is how they stop being aligned.
 *
 * `role="group"` with the label as its accessible name, because a row of toggles is a group and not
 * a fieldset of inputs: `<legend>` would be the right element for radio buttons, and these are
 * `aria-pressed` buttons. */
function FieldGroup({
  label,
  hint,
  className,
  controlsClassName,
  children,
}: {
  label: string;
  /** Pushed to the end of the header row, dimmed — `Field`'s own `hint` slot, in the same place. */
  hint?: React.ReactNode;
  className?: string;
  /** The row of controls, for the groups whose spacing is not the segments'. */
  controlsClassName?: string;
  children: React.ReactNode;
}) {
  const labelId = useId();

  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex h-4 items-center gap-2 leading-4">
        <Overline
          id={labelId}
          className="whitespace-nowrap"
        >
          {label}
        </Overline>
        {hint != null && <Overline className="ml-auto whitespace-nowrap text-gr-fg-4">{hint}</Overline>}
      </div>
      {/* ⚠️ **6px, which is the handoff's gap for a row of segments** — this was `gap-x-3.5` (14px,
          the figure the *checkboxes* use) and the 8px difference was enough to make two of the filter
          modal's rows wrap: `stars` needs 272px on one line and had 291 to spend, but at 14px it
          wanted 312. The right gap is both the faithful one and the one that fits. */}
      {/* biome-ignore lint/a11y/useSemanticElements: a `<fieldset>` takes its name from a `<legend>`, which renders *inside* the box — and this label has to sit in the same 16px header row `Field` uses, or two columns stop lining up. It also carries `min-inline-size: min-content` in the UA stylesheet, which would stop the `min-w-72 flex-1` halves from wrapping. */}
      <div
        role="group"
        aria-labelledby={labelId}
        className={cn("flex flex-wrap items-center gap-1.5", controlsClassName)}
      >
        {children}
      </div>
    </div>
  );
}

export { FieldGroup };
