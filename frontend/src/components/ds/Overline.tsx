import { cn } from "@lib/utils";

import type * as React from "react";

/* `.gr-lab` — the system's most-used label: wide uppercase, tertiary ink, 10px.
 *
 * It names things without being read as content: the caption above a field, the meta
 * items in the top chrome, the hints in the status bar. Anywhere the eye should register
 * a category rather than a value.
 *
 * The handoff sets 9.5px / 0.16em; DS 01 snapped those to `text-3xs` (10px) and
 * `tracking-caps` (0.14em), which is where the column headers already sat. */
function Overline({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="overline"
      className={cn("text-3xs uppercase tracking-caps text-gr-fg-3", className)}
      {...props}
    />
  );
}

export { Overline };
