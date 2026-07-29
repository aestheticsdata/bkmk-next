import { cn } from "@lib/utils";

import type * as React from "react";

/* `.gr-slot` — where a screenshot goes before there is a screenshot. The record page and
 * the create form both show one; it reads "1280×800" or "queued · 1280×800".
 *
 * A sunken dashed rectangle rather than a spinner or a grey box, because the state it
 * describes is durable: bkmk captures screenshots out of band, so a record can sit
 * queued for a while and the slot has to look like a reserved space, not like something
 * that is loading right now.
 *
 * Radius 10 → 8 (`rounded-lg`), the DS 01 call: the slot nests in a card at 12, and an
 * inner radius matching its container makes the curve spill.
 *
 * The height is the caller's — it is a different aspect ratio on the record page and on
 * the create form — so this sets everything except that. */
function ShotSlot({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="shot-slot"
      className={cn(
        "grid place-items-center rounded-lg border border-dashed border-gr-border-2 bg-gr-sunk text-3xs uppercase tracking-caps text-gr-fg-4 inset-shadow-gr-sunk",
        className,
      )}
      {...props}
    />
  );
}

export { ShotSlot };
