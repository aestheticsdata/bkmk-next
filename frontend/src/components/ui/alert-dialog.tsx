"use client";

import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import type * as React from "react";

function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return (
    <AlertDialogPrimitive.Root
      data-slot="alert-dialog"
      {...props}
    />
  );
}

function AlertDialogTrigger({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      {...props}
    />
  );
}

function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal
      data-slot="alert-dialog-portal"
      {...props}
    />
  );
}

/* ⚠️ **`z-52`, above `ui/dialog`'s 50, and that is the whole reason this file has its own layer**
 * (COS-320). The delete confirmation is reachable *from inside the edit modal*, so it is the one
 * surface in the system that opens over another portalled surface. At an equal `z-index` the two
 * would be settled by DOM order — which happens to be right, since Radix appends portals in mount
 * order and this one mounts second — but "correct by accident of mount order" is not a thing to
 * leave in a stacking context. The handoff numbers the pair 52 / 53 and so does this.
 *
 * The scrim itself is the dialog's: the edit modal below is *meant* to dim, because the question on
 * top is about the record it is editing. */
function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-52 bg-gr-scrim backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

/* **The same panel as `ui/dialog`, one size down** (COS-320).
 *
 * This shipped as stock shadcn — centred text, a `p-5` box, `gap-4` between blocks, an icon slot
 * above the title — and none of that is the shape GRAPHITE draws. The handoff's `ConfirmDelete` is a
 * `.gr-cmd` header strip, a padded body and a footer strip on `--panel-2`: the anatomy of every other
 * modal in the system, which is `ui/dialog`'s. So this file is now that file at a narrower cap,
 * rather than a second modal language living beside it. Nothing consumed the stock layout — UI 11 is
 * this component's first caller — so there was no migration to weigh against it, and the centred
 * variants and the media slot left rather than sit unused as a second way to write a dialog.
 *
 * `max-w-110` is the handoff's `min(440px, 100% - 20px)` — the narrowest of the system's three
 * (440 · 640 · 680), and the default here rather than the caller's business: 640 is a default because
 * `ui/dialog` has three consumers wanting different widths, and an alert dialog asks one short
 * question.
 *
 * ⚠️ **`font-mono text-xs`, for the reason §7 of the DS doc gives twice.** A portal renders into a
 * `body` that carries neither the family (COS-321) nor the size (COS-342) — both live on the screen
 * root — so a portalled surface that does not restate them draws in the system sans at 16px. This is
 * the third portalled surface in the app and it was written with the rule rather than against it.
 *
 * The panel is a column and the body is the scroller (COS-341), same as `ui/dialog`. Three short
 * lines will never need it; a record with a 400-character title on a short viewport will, and the
 * alternative is a footer pushed off the bottom of the screen with the `delete record` button on it. */
function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-53 flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.25rem)] max-w-110 translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-2xl border border-gr-border-2 bg-gr-panel font-mono text-xs text-gr-fg shadow-gr-modal duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

/** The command bar again — see `DialogHeader`, which this matches line for line. Its one difference
 *  is the title's ink, and that belongs to `AlertDialogTitle`. */
function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "flex min-h-11.5 shrink-0 items-center gap-3 border-b border-gr-border bg-gr-panel-2 px-3.5 inset-shadow-gr-hair",
        className,
      )}
      {...props}
    />
  );
}

/** The scroll container, and the containing block for what it scrolls (COS-341) — `relative` is
 *  load-bearing, not decoration. `py-4.5 px-5` is the handoff's `18px 20px`; the `gap-2.5` is its 10.
 *
 *  No `mr-1.5` here, unlike `DialogBody`. That margin buys a channel for an overlay scrollbar beside
 *  a column of *fields*, whose right edges the thumb would otherwise land on. This body holds three
 *  lines of prose that will not scroll in practice, and the 6px it costs would show as the body's
 *  text ending short of the footer's buttons on every single render. */
function AlertDialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-body"
      className={cn("gr-scroll relative grid min-h-0 gap-2.5 overflow-y-auto px-5 py-4.5", className)}
      {...props}
    />
  );
}

/** `DialogFooter`'s strip, and it wraps for the same reason: unconditionally, because wrapping is
 *  already conditional on the content not fitting, and a container query would be inert on a
 *  portalled element (§7). */
function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-2.5 border-t border-gr-border bg-gr-panel-2 px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}

/** `DELETE` — the one place a modal title is written in oxide rather than the strong ink, because
 *  the title *is* the warning. `DialogTitle` keeps `text-gr-fg-2`. */
function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-xs leading-none font-semibold uppercase tracking-caps text-gr-accent-2", className)}
      {...props}
    />
  );
}

/* ⚠️ **This is the body's warning line, not the header's `record 42`** — and which one it is decides
 * what a screen reader says. Radix wires `aria-describedby` to it, so it should be the sentence that
 * states the consequence ("note, tags, screenshot and alarm go with it…"), not the identifier, which
 * is already announced with the title. `DialogDescription` is the opposite — an overline beside the
 * title — hence the two components styling nothing alike.
 *
 * 11.5px → `text-2xs` and `1.6` → `leading-relaxed` (1.625), both off the §3 mapping table. */
function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-2xs leading-relaxed text-gr-fg-3", className)}
      {...props}
    />
  );
}

/** The button that performs the thing. `danger-solid` by default — filled oxide is the system's
 *  "this one actually destroys", and an alert dialog exists to hold exactly one of them. */
function AlertDialogAction({
  className,
  variant = "danger-solid",
  size = "chrome",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button
      variant={variant}
      size={size}
      asChild
    >
      <AlertDialogPrimitive.Action
        data-slot="alert-dialog-action"
        className={cn(className)}
        {...props}
      />
    </Button>
  );
}

/** The way out, and the one Radix focuses on open — which is why the destructive button never is. */
function AlertDialogCancel({
  className,
  variant = "chrome",
  size = "chrome",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button
      variant={variant}
      size={size}
      asChild
    >
      <AlertDialogPrimitive.Cancel
        data-slot="alert-dialog-cancel"
        className={cn(className)}
        {...props}
      />
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
