"use client";

import { cn } from "@lib/utils";
import { Progress as ProgressPrimitive } from "radix-ui";

import type * as React from "react";

/* The GRAPHITE meter, `.gr-meter` in the handoff (COS-291) — the filter modal's match
 * gauge and the reminders' countdown bar.
 *
 * Radix's Progress rather than a `ds/Meter`: it is a progress bar, and the primitive
 * brings the `progressbar` role and `aria-valuenow` for free.
 *
 * The bar turns oxide when an alarm is within a day. That is a caller's decision, not a
 * prop: pass `[&_[data-slot=progress-indicator]]:bg-gr-accent-2` in `className`. Keeping
 * it out of the signature is what lets `shadcn add progress` regenerate this file. */
function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-gr-border inset-shadow-gr-sunk", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 rounded-full bg-gr-accent transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
