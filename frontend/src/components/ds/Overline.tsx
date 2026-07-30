import { cn } from "@lib/utils";
import { Slot } from "radix-ui";

import type * as React from "react";

/* `.gr-lab` — the system's most-used label: wide uppercase, tertiary ink, 10px.
 *
 * It names things without being read as content: the caption above a field, the meta
 * items in the top chrome, the hints in the status bar. Anywhere the eye should register
 * a category rather than a value.
 *
 * The handoff sets 9.5px / 0.16em; DS 01 snapped those to `text-3xs` (10px) and
 * `tracking-caps` (0.14em), which is where the column headers already sat.
 *
 * ⚠️ **`asChild` for a label that is also a link, rather than a `<Link>` wrapped around one**
 * (COS-298). Wrapping puts a 12px element around 10px text: the wrapper is the flex item, its line
 * box carries a strut at the *inherited* font size, and that strut is taller than the 10px span
 * inside it — so the label sits about a pixel and a half below a bare `Overline` beside it. It is
 * visible in a row as short as `register · or · sign in`. `asChild` makes the link *be* the label:
 * one element, one font size, nothing to disagree about. */
function Overline({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & {
  /** Render the caller's element with these styles — `<Overline asChild><Link …/></Overline>`. */
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="overline"
      className={cn("text-3xs uppercase tracking-caps text-gr-fg-3", className)}
      {...props}
    />
  );
}

export { Overline };
