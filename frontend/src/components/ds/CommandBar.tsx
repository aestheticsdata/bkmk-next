import { cn } from "@lib/utils";

import type * as React from "react";

/* `.gr-cmd` — the strip along the top of a card, and the header of every modal.
 *
 * One component for both because the handoff uses one class for both: the filter, edit
 * and delete modals all open with a `.gr-cmd` carrying a title, a couple of labels and a
 * close glyph. Treating the modal header as "a card's command bar that happens to be in a
 * modal" is what keeps the two from drifting apart.
 *
 * It is a flex row and nothing more — the caller pushes an item right with `ml-auto`, as
 * the handoff does for the match count and the close button.
 *
 * `min-h` rather than `h`: the command bar holds the search field, which is taller than
 * its own line box, and the row must grow rather than clip. */
function CommandBar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-bar"
      className={cn(
        "flex min-h-11.5 shrink-0 items-center gap-3 border-b border-gr-border bg-gr-panel-2 px-3.5 inset-shadow-gr-hair @max-3xl:min-h-13.5 @max-3xl:gap-2 @max-3xl:px-3",
        className,
      )}
      {...props}
    />
  );
}

/* `.gr-pager` — the command bar's mirror image at the bottom of the card. Same surface,
 * same hair line, border on the other side, and no minimum height because it only ever
 * holds short controls. */
function PagerBar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pager-bar"
      className={cn(
        "flex shrink-0 items-center gap-3.5 border-t border-gr-border bg-gr-panel-2 px-3.5 py-2 inset-shadow-gr-hair @max-3xl:gap-2.5 @max-3xl:px-3",
        className,
      )}
      {...props}
    />
  );
}

export { CommandBar, PagerBar };
