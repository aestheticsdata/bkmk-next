import { cn } from "@lib/utils";

import type * as React from "react";

/* `.gr-card` — the panel every screen is built out of.
 *
 * GRAPHITE has no page-level content: the desk is a flat grey field and everything sits
 * on a card floating a millimetre above it. The float is two shadows at once — the outer
 * one below, the hair line along the top edge — which is why they live on separate
 * Tailwind layers and compose here instead of being one baked value.
 *
 * `overflow-hidden` matters more than it looks: the command bar and the pager are flush
 * to the card's edges and would otherwise square off its corners. `min-h-0` is the flex
 * escape hatch that lets an inner scroller actually scroll.
 *
 * The radius grows on narrow widths (12 → 16), which is the handoff's call: the same
 * curve reads tighter when the card spans the full width of a phone. */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "min-h-0 overflow-hidden rounded-xl border border-gr-border bg-gr-panel shadow-gr-1 inset-shadow-gr-hair @max-3xl:rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
