import { cn } from "@lib/utils";

import type * as React from "react";

/* The multi-line field. The handoff writes `<textarea className="gr-in">`, that is the
 * same skin as the single-line input, so the classes below mirror `ui/input.tsx` and only
 * add what a textarea needs: a minimum height and vertical-only resize.
 *
 * Not installed by PLAT 04 — its list of 13 components came from the spec, which missed
 * the note field on the record form. Added here from the shadcn registry rather than
 * hand-rolled in `ds/`, since shadcn provides it and `ds/` is for what it does not. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content min-h-16 w-full resize-y rounded-lg border border-gr-border bg-gr-sunk px-2.75 py-2 text-gr-fg inset-shadow-gr-sunk transition-[border-color,box-shadow] duration-150 outline-none",
        "selection:bg-gr-selection selection:text-gr-fg-2 placeholder:text-gr-fg-4",
        "focus-visible:border-gr-accent focus-visible:ring-3 focus-visible:ring-gr-ring",
        "aria-invalid:border-gr-danger aria-invalid:ring-3 aria-invalid:ring-gr-danger/25",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
