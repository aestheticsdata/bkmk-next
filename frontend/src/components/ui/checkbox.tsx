"use client";

import { cn } from "@lib/utils";
import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import type * as React from "react";

/* Repainted onto the GRAPHITE tokens (COS-298), as `ui/progress` and `ui/button` were before it:
 * a sunk field when empty, the teal fill of the primary button when checked, and the same focus
 * ring as every other control. The `dark:` rules of the registry version are dropped — GRAPHITE
 * is one light theme.
 *
 * 14px rather than 16: it sits beside 11px text, and a box taller than its own label reads as a
 * second element rather than as part of the line. `rounded-sm` is 4px, which is what the registry
 * spelled `rounded-[4px]` — the same value, back on the scale the radius token file insists on.
 *
 * ⚠️ **A departure from the handoff, which draws `[x]` in teal.** A bracket glyph is text: no hit
 * area beyond its two characters, no focus ring, no state for a screen reader to read. Radix gives
 * all three, and the fill keeps the handoff's colour. */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-3.5 shrink-0 rounded-sm border border-gr-border-2 bg-gr-sunk shadow-xs transition-shadow outline-none focus-visible:border-gr-accent focus-visible:ring-[3px] focus-visible:ring-gr-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-gr-danger data-[state=checked]:border-gr-teal-border data-[state=checked]:bg-gr-accent data-[state=checked]:text-gr-teal-fg",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
