import { cn } from "@lib/utils";

import type * as React from "react";

/* `.gr-caret` — the block caret that closes a title. GRAPHITE's one nod to the terminal,
 * used on the auth heading and after the search prompt.
 *
 * A real element rather than the handoff's `::after`, because a pseudo-element cannot be
 * hidden from assistive technology and this glyph is pure texture. It carries no meaning
 * and must not be read out.
 *
 * `steps(1)`, not a fade: a caret is lit or dark, never halfway. The timing lives in
 * `--animate-gr-caret` so this stays a named animation rather than an arbitrary value —
 * and `prefers-reduced-motion` in `animations.css` stops it dead, which matters here more
 * than anywhere else in the system since it is the only thing that never stops on its
 * own. */
function BlinkCursor({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="blink-cursor"
      aria-hidden
      className={cn("ml-px inline-block animate-gr-caret", className)}
      {...props}
    >
      █
    </span>
  );
}

export { BlinkCursor };
