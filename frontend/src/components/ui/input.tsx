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
 * panel, which is what makes the raised buttons beside it look raised. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-lg border border-gr-border bg-gr-sunk px-2.75 py-2 text-gr-fg inset-shadow-gr-sunk transition-[border-color,box-shadow] duration-150 outline-none",
        "selection:bg-gr-selection selection:text-gr-fg-2 placeholder:text-gr-fg-4",
        "file:inline-flex file:border-0 file:bg-transparent file:text-3xs file:uppercase file:tracking-widest file:text-gr-fg-3",
        "focus-visible:border-gr-accent focus-visible:ring-3 focus-visible:ring-gr-ring",
        "aria-invalid:border-gr-danger aria-invalid:ring-3 aria-invalid:ring-gr-danger/25",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
