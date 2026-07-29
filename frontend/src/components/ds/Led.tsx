import { cn } from "@lib/utils";

import type * as React from "react";

/* `.gr-led` — the seven-pixel indicator at the right of the top chrome, and on the auth
 * card. The system's one piece of pure ornament, and the reason it earns its place is
 * that the halo is a real focus ring's worth of teal: it says "this instrument is
 * powered" in the same colour the interface uses for "this is live".
 *
 * `ring-3` rather than a shadow — Tailwind's ring is exactly `0 0 0 3px`, which is what
 * the handoff writes, and it composes with the shadow layers instead of fighting them.
 *
 * Decoration, so `aria-hidden`: it reports no state a user could act on. */
function Led({ className, ...props }: React.ComponentProps<"i">) {
  return (
    <i
      data-slot="led"
      aria-hidden
      className={cn("block size-1.75 shrink-0 rounded-full bg-gr-accent ring-3 ring-gr-ring", className)}
      {...props}
    />
  );
}

export { Led };
