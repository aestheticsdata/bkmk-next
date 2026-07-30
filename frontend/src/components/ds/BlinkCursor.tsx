import { cn } from "@lib/utils";

import type * as React from "react";

/* `.gr-caret` — the caret that closes a title. GRAPHITE's one nod to the terminal, used on the
 * auth heading and after the search prompt.
 *
 * A real element rather than the handoff's `::after`, because a pseudo-element cannot be
 * hidden from assistive technology and this mark is pure texture. It carries no meaning
 * and must not be read out.
 *
 * **An underscore, and drawn rather than typed** (COS-298) — two departures from the handoff,
 * which writes `content: "\2588"`, the full block.
 *
 * The first version copied that glyph and it came out visibly taller than the text it closes:
 * U+2588 fills the em box top to bottom — and overshoots it in IBM Plex Mono — while the letters
 * beside it only reach cap height, about 0.7em. At a 24px title that is a 24px+ slab next to 17px
 * letters, which reads as a rendering accident rather than a caret. Drawing the mark states its
 * size instead of inheriting a glyph's metrics.
 *
 * The second is a design call: a solid block is the heaviest thing on the screen in a system built
 * out of hairlines — 1px rules, 1px light edges, a 6px meter. An underscore is the same terminal
 * signal at the system's own weight.
 *
 * Dimensions are `em`, not steps on the spacing scale: a caret that does not scale with its own
 * text is the first bug above, and the native scale cannot express "as thin as the rules, as wide
 * as a character". So: half an em wide, 0.08em thick — 2px under a 24px title, 1px under 12px
 * text — dropped just clear of the baseline, where the `_` glyph sits.
 *
 * `bg-current` rather than a token: the caller colours it by colouring its text (`text-gr-accent`
 * on both auth screens), the same way the glyph took its colour before.
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
      className={cn(
        "ml-[0.12em] inline-block h-[0.08em] w-[0.5em] translate-y-[0.06em] animate-gr-caret bg-current",
        className,
      )}
      {...props}
    />
  );
}

export { BlinkCursor };
