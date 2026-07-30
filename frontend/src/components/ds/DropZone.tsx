import { cn } from "@lib/utils";

import type * as React from "react";

/* `.gr-drop` — the import screen's file target. Same sunken dashed language as
 * `ShotSlot`, one step larger: radius 12 instead of 8, generous padding, contents
 * centred both ways.
 *
 * Bigger than it needs to be on purpose — a drop target that is hard to miss is the whole
 * affordance, and the import screen has nothing else on it competing for the space.
 *
 * No drag state here. Whether a file is hovering is the caller's business (UI 08,
 * COS-304, wires the events); it passes the border and background change through
 * `className` when `dragover` fires. Keeping the state out means this stays a shape and
 * not a half-built file input. */
function DropZone({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drop-zone"
      className={cn(
        "grid justify-items-center content-center gap-2 rounded-xl border border-dashed border-gr-border-2 bg-gr-sunk p-6.5 text-gr-fg-3 inset-shadow-gr-sunk @max-3xl:p-5",
        className,
      )}
      {...props}
    />
  );
}

export { DropZone };
