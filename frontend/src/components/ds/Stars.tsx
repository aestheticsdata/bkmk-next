import { cn } from "@lib/utils";

import type * as React from "react";

const MAX_STARS = 5;

/* `GStars` — the rating, five glyphs with the unearned ones dimmed rather than absent.
 *
 * Showing all five is the point: a column of ratings only compares if every cell is the
 * same width. Dropping the empty stars would turn the column into ragged text.
 *
 * A single `<span>` with the count in `aria-label`, not five elements — a screen reader
 * should hear "3 out of 5", not five stars in a row. `aria-hidden` on the glyphs keeps
 * them out of the accessibility tree entirely, and `role="img"` is what makes the label
 * count: a bare `<span>` has no role, so its `aria-label` is discarded.
 *
 * The handoff's -0.5px letter-spacing snaps to native `tracking-tighter`: at 12px that is
 * -0.6px, and it exists to stop the glyphs from reading as five separate words.
 *
 * COS-412 moves the fill off the handoff's `--accent-2`: oxide is shared with errors and
 * the imminent-alarm state, so a dedicated `--gr-star` token is what turns pink without
 * repainting either of those. */
function Stars({ n, className, ...props }: React.ComponentProps<"span"> & { n: number }) {
  const filled = Math.max(0, Math.min(MAX_STARS, Math.round(n)));
  return (
    <span
      data-slot="stars"
      role="img"
      aria-label={`${filled} out of ${MAX_STARS}`}
      className={cn("whitespace-nowrap tracking-tighter text-gr-star", className)}
      {...props}
    >
      <span aria-hidden>{"★".repeat(filled)}</span>
      <span
        aria-hidden
        className="text-gr-fg-4 opacity-55"
      >
        {"★".repeat(MAX_STARS - filled)}
      </span>
    </span>
  );
}

export { MAX_STARS, Stars };
