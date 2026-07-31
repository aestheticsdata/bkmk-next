import { cn } from "@lib/utils";

import type * as React from "react";

/* The multi-line field. The handoff writes `<textarea className="gr-in">`, that is the
 * same skin as the single-line input, so the classes below mirror `ui/input.tsx` and only
 * add what a textarea needs: a minimum height and vertical-only resize.
 *
 * Not installed by PLAT 04 — its list of 13 components came from the spec, which missed
 * the note field on the record form. Added here from the shadcn registry rather than
 * hand-rolled in `ds/`, since shadcn provides it and `ds/` is for what it does not.
 *
 * `gr-scroll` because it is `resize-y`: dragged shorter it becomes a scroll container of its
 * own, and there is no reason for the system's bar to stop at the modal that contains it
 * (COS-341). `text-xs` for the same reason as `ui/input.tsx` — see there. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "gr-scroll field-sizing-content min-h-16 w-full resize-y rounded-lg border border-gr-border bg-gr-sunk px-3 py-2 text-xs text-gr-fg inset-shadow-gr-sunk transition-[box-shadow] duration-150 outline-none",
        "selection:bg-gr-selection selection:text-gr-fg-2 placeholder:text-gr-fg-4",
        /* Ring only, no border swap — same reasoning, and the same words, as `ui/input.tsx`. */
        "focus-visible:ring-3 focus-visible:ring-gr-ring",
        "aria-invalid:ring-3 aria-invalid:ring-gr-danger/25",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
