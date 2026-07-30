import { cn } from "@lib/utils";

import type * as React from "react";

/* `.gr-chip` — a category on a bookmark. The densest thing in the system: 18px tall, and
 * a table row holds three of them.
 *
 * The dot carries the category's identity. Its hue comes from the data, so it is the one
 * colour in GRAPHITE that cannot be a token — the handoff drives it through a `--th`
 * custom property and a fixed saturation and lightness, which is what keeps twenty
 * categories looking like one family instead of twenty unrelated colours.
 *
 * `dashed` is the add-a-category affordance: same chip, no dot, dimmer ink, a dashed
 * border. It reads as a slot rather than a value.
 *
 * `white-space: nowrap` is not decoration — a wrapped chip breaks the row's height. */
function Chip({
  className,
  hue,
  dashed = false,
  children,
  ...props
}: React.ComponentProps<"span"> & { hue?: number; dashed?: boolean }) {
  return (
    <span
      data-slot="chip"
      className={cn(
        "inline-flex h-4.5 items-center gap-1.5 whitespace-nowrap rounded-md border px-2 text-3xs tracking-wider",
        dashed ? "border-dashed border-gr-border text-gr-fg-3" : "border-gr-border bg-white/22 text-gr-fg",
        className,
      )}
      {...props}
    >
      {!dashed && (
        <i
          data-slot="chip-dot"
          className="block size-1.5 shrink-0 rounded-full bg-[hsl(var(--th,40)_34%_32%)]"
          style={hue == null ? undefined : ({ "--th": hue } as React.CSSProperties)}
        />
      )}
      {children}
    </span>
  );
}

export { Chip };
