import { Button } from "@components/ui/button";

import type * as React from "react";

/* `.gr-mini` — the confirm / cancel pair that replaces a row's date column while a
 * delete is pending. 20px tall, the smallest control in the system.
 *
 * A preset over `ui/button`, not a component: the ticket lists MiniButton among the
 * primitives, but a mini button *is* a button, and reimplementing it in `ds/` would give
 * bkmk two focus rings, two disabled states and two sets of transitions to keep in step.
 * This exists so the UI lot can write the name the handoff uses instead of remembering
 * which pair of cva keys spells it.
 *
 * `danger` gets the filled oxide rather than the outline: at 20px an outline reads as a
 * border, not as a warning, and this button is the one that actually deletes the row. */
function MiniButton({
  danger = false,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "variant" | "size"> & { danger?: boolean }) {
  return (
    <Button
      variant={danger ? "danger-solid" : "chrome"}
      size="mini"
      {...props}
    />
  );
}

export { MiniButton };
