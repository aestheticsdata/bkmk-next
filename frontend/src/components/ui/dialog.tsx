"use client";

import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import type * as React from "react";

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      {...props}
    />
  );
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      {...props}
    />
  );
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      {...props}
    />
  );
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      {...props}
    />
  );
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-gr-scrim backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

/* **The GRAPHITE geometry, set here rather than by each modal** (COS-300).
 *
 * `w-[calc(100%-1.25rem)] max-w-160` is the handoff's `min(640px, 100% - 20px)` written as two
 * classes: the width is always the viewport less a 10px gutter each side, capped at 640. It replaces
 * shadcn's `w-full max-w-[calc(100%-1.25rem)] sm:max-w-lg`, which pinned every modal to 512px above
 * 640px of viewport and needed three overrides to unpin.
 *
 * 640 is the filter modal's number and also the middle of the system's three — the delete
 * confirmation is `min(440px, …)` (COS-320) and the edit modal `min(680px, …)` (COS-319). Both are one
 * `max-w-*` away, which is the point of leaving the fluid half fixed: a caller changes the cap, never
 * the gutter.
 *
 * `max-h-[calc(100dvh-1.5rem)]` is the handoff's `calc(100% - 24px)`, and with `overflow-auto` it is
 * what "fluid and scrollable" means on a short viewport — the whole panel scrolls, the header sticks
 * to its top, and a footer that wants to stay put says `sticky bottom-0`.
 *
 * The entrance is `bkmk-pop` by another name: `fade-in-0 zoom-in-95` over 200ms is the keyframe's
 * `opacity 0 → 1, scale .96 → 1` in `tw-animate-css`'s vocabulary. See `styles/animations.css`. */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          /* ⚠️ **`font-mono` was missing here** (found while building the account menu, COS-321).
             The shell puts the typeface on the screen root, and a portal renders outside it into a
             `body` that has none until the global reset lands — so the filter modal has been
             drawing in `-apple-system` since COS-300. Measured through CDP, on both portalled
             surfaces. */
          "fixed top-[50%] left-[50%] z-50 grid max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.25rem)] max-w-160 translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-2xl border border-gr-border-2 bg-gr-panel font-mono text-gr-fg shadow-gr-modal duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-3.5 right-3.5 rounded-md text-gr-fg-3 transition-colors hover:text-gr-fg-2 focus-visible:ring-3 focus-visible:ring-gr-ring focus-visible:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/* The header is the card's command bar again, not a stack of centred text (COS-291). All
 * three GRAPHITE modals open with the same strip: a title, a couple of overlines, the
 * close glyph pushed right. Sticky, because the content scrolls under it when a long form
 * outgrows the viewport.
 *
 * ⚠️ **No narrow-width variant, and it is not an oversight.** This carried a `@max-3xl:`
 * copy of `CommandBar`'s fold — 54px tall, 8px gap, 12px padding — which could never
 * apply: the modal is portalled to `document.body`, outside the app screen, and that is
 * the only element in the system declaring `container-type`, so the query had no container
 * and evaluated false at every width.
 *
 * **COS-300 composed the first real modal and the variant stayed gone**, deliberately:
 *
 * - The 46 → 54px growth has no reason here in the first place. A card's command bar grows
 *   because it holds the search field, which is taller than its line box; a modal header
 *   holds a title and a close glyph. The handoff only gives it that rule by sharing the
 *   `.gr-cmd` class, and only ever renders its modal *inside* the screen. At 420px the
 *   filter modal's header holds its title, its mode, its count and its close glyph on one
 *   46px line with room to spare — measured.
 * - A self-container would not help: it would measure the modal, and a modal capped at 640px
 *   is always under 768px, so `@max-3xl` would be permanently *true*, which is worse than
 *   never.
 * - What the filter modal's body needed was a fold in the other direction — two pairs of
 *   groups becoming one column — and it got it from `flex-wrap` plus a measured `min-w-*`,
 *   with no query at all. See §7 and §11 of docs/design-system.md. */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "sticky top-0 z-10 flex min-h-11.5 shrink-0 items-center gap-3 border-b border-gr-border bg-gr-panel-2 px-3.5 inset-shadow-gr-hair",
        className,
      )}
      {...props}
    />
  );
}

/* Added to the shadcn set: with the padding moved off `DialogContent` — the header and
 * footer are flush to the modal's edges and would otherwise float inside a margin — the
 * body needs somewhere to carry its own. */
function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("grid gap-4 px-5 py-4.5", className)}
      {...props}
    />
  );
}

/* It wraps unconditionally, not behind a width variant. The wrap used to sit behind the
 * same dead `@max-3xl:` query as the header — and the variant was not buying anything in
 * the first place: wrapping is already conditional on the content not fitting.
 * Unconditional, it does nothing while the buttons fit and wraps as soon as they do not,
 * which also covers the widths a single threshold would have missed. The gap is a flex
 * `gap`, so the wrapped rows get their 10px too. */
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-2.5 border-t border-gr-border bg-gr-panel-2 px-5 py-3",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button
            variant="chrome"
            size="chrome"
          >
            Close
          </Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-xs leading-none font-semibold uppercase tracking-caps text-gr-fg-2", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-2xs tracking-caps text-gr-fg-3 uppercase", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
