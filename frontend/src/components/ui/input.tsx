import { cn } from "@lib/utils";

import type * as React from "react";

/* The GRAPHITE field, `.gr-in` in the handoff (COS-291).
 *
 * Restyled outright rather than added as a variant, unlike `ui/button.tsx`: bkmk has one
 * theme, nothing renders the neutral input, and a field has no equivalent of the button's
 * six stock fills to preserve. `ui/textarea.tsx` repeats these classes deliberately —
 * hoisting them into a shared constant would make re-running `shadcn add` a merge.
 *
 * A sunken field, not a raised one: the inset shadow reads as a groove cut into the
 * panel, which is what makes the raised buttons beside it look raised.
 *
 * ⚠️ **`text-xs` is a deliberate departure from the handoff** (COS-342), which writes
 * `font: inherit` and nothing else. Inheriting only works under an ancestor that set
 * something: the shell sets the app's 12px on the screen root, and a field rendered in a
 * portal — the edit modal's three — landed outside it and came back at the browser's 16px
 * default. `DialogContent` now carries the size too, which fixes it from above; this fixes
 * it from below, so that a field never again depends on who renders it. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-lg border border-gr-border bg-gr-sunk px-3 py-2 text-xs text-gr-fg inset-shadow-gr-sunk transition-[box-shadow] duration-150 outline-none",
        "selection:bg-gr-selection selection:text-gr-fg-2 placeholder:text-gr-fg-4",
        "file:inline-flex file:border-0 file:bg-transparent file:text-3xs file:uppercase file:tracking-widest file:text-gr-fg-3",
        /* **The ring carries the state on its own, and the border never changes colour.**
         * The handoff swaps `border-color` to the full-strength accent *as well* as ringing the
         * field (`.gr-in:focus{border-color:var(--accent);box-shadow:…0 0 0 3px var(--ring)}`), and
         * on screen that reads as two rings: a soft 3px band, then a hard hairline biting the box's
         * edge inside it. Two edges for one state, one of them the only saturated colour on a panel
         * of greys. Owner's call, and a departure from the handoff — hence the ring alone.
         *
         * `transition-[box-shadow]` rather than `[border-color,box-shadow]` follows from it: there is
         * no border colour left to animate. */
        "focus-visible:ring-3 focus-visible:ring-gr-ring",
        "aria-invalid:ring-3 aria-invalid:ring-gr-danger/25",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
