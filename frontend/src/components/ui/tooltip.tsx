"use client";

import { cn } from "@lib/utils";
import { Tooltip as TooltipPrimitive } from "radix-ui";

import type * as React from "react";

/* **The bubble — the one definition of what a tooltip looks like** (BMK-69), worn by both engines:
 * the anchored one below, and `ds/CursorTooltip`, which follows the pointer instead. It is exported
 * for exactly that reason: two descriptions of one surface drift the first time one is edited, and
 * `ds/Field` and `ds/MiniButton` already compose over `ui/` this way.
 *
 * It reads as the dropdown menu does — the same panel, the same structural border, the same hair
 * line — because it is the same kind of thing: a small surface floating over the desk. **At 90%**,
 * which the menu is not: a menu is a place you act, a tooltip is a thing you read *about* what is
 * under it, and letting the rows below show faintly through says which of the two it is. The tint
 * is on the background alone — the ink and the border stay opaque, and the element's own opacity
 * belongs to the fade.
 *
 * ⚠️ **A portalled surface inherits neither the typeface nor the size** (§7, and the bug COS-342):
 * `font-mono` lives on the screen root and `body` carries nothing, so anything portalled to it comes
 * back in the system sans at 16px unless it states both. Hence `font-mono` and `text-2xs` here.
 *
 * `z-60` is above every other portalled surface — the modal is 50, the delete confirmation 52 / 53
 * (`ui/alert-dialog`) — because a tooltip is the one thing that may legitimately be shown over any
 * of them. */
const TOOLTIP_SURFACE =
  "z-60 w-fit max-w-60 rounded-lg border border-gr-border-2 bg-gr-panel-2/90 px-2.5 py-2 font-mono text-2xs text-gr-fg shadow-gr-2 inset-shadow-gr-hair";

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipPrimitive.Root
      data-slot="tooltip"
      {...props}
    />
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      {...props}
    />
  );
}

/* The anchored engine: pinned to its trigger, and the only one of the two a keyboard can reach —
 * Radix opens it on focus and closes it on Escape.
 *
 * **The stock arrow is gone.** shadcn paints it in the same flat colour as its bubble, which works
 * on a surface with no border; GRAPHITE's has one, and a rotated square would have to fake two of
 * its edges to sit on it. The dropdown menu and the select carry none either — the offset says where
 * the surface belongs.
 *
 * `duration-120` matches the row's transitions, and is the fade at the point of use, as
 * `animations.css` asks. It goes through the utility rather than an inline `animationDuration`:
 * Radix's popper rewrites the `animation` shorthand on this node while it positions itself, which
 * would wipe an inline longhand and strand the fade at the library default. */
function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          TOOLTIP_SURFACE,
          "origin-(--radix-tooltip-content-transform-origin) animate-in fade-in-0 duration-120 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { TOOLTIP_SURFACE, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
