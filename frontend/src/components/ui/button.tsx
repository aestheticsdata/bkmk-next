import { cn } from "@lib/utils";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";

import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        /* ─── GRAPHITE (COS-291) ────────────────────────────────────────────────────
         * Added beside the stock variants rather than replacing them, so re-running
         * `shadcn add button` keeps regenerating cleanly. The six above render in the
         * neutral filler palette and no bkmk surface uses them.
         *
         * The lift on hover is the whole interaction: `translateY(-1px)` plus the outer
         * shadow growing from step 1 to step 2, while the hair line stays put — which
         * is exactly what the separate inset-shadow layer buys us. */
        chrome:
          "border border-gr-border-2 bg-linear-to-b from-white/26 to-white/6 text-gr-fg shadow-gr-1 inset-shadow-gr-hair hover:-translate-y-px hover:shadow-gr-2",
        primary:
          "border border-gr-teal-border bg-linear-to-b from-gr-teal-from to-gr-teal-to text-gr-teal-fg shadow-gr-primary hover:-translate-y-px",
        /* Outline oxide: destructive, but not yet destroying anything. */
        danger:
          "border border-gr-accent-2/50 bg-linear-to-b from-white/20 to-white/4 text-gr-accent-2 shadow-gr-1 inset-shadow-gr-hair hover:bg-gr-accent-2/12 hover:-translate-y-px hover:shadow-gr-2",
        /* Filled oxide: the button that actually deletes. One per screen, never two. */
        "danger-solid":
          "border border-gr-oxide-border bg-linear-to-b from-gr-oxide-from to-gr-oxide-to text-gr-oxide-fg shadow-gr-oxide hover:-translate-y-px",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",

        /* ─── GRAPHITE geometry (COS-291) ───────────────────────────────────────────
         * Split from the variants above on purpose: the handoff's `.gr-btn` carries the
         * geometry and `.pri` / `.danger` only recolour it, so `variant` and `size` stay
         * orthogonal. The common call is `variant="chrome" size="chrome"`.
         *
         * Radius 9 → `rounded-lg` (8) per the DS 01 snapping table.
         *
         * Each also repoints the focus ring at the GRAPHITE teal. It rides here rather
         * than in the base string because the base is shared with the six stock variants,
         * which stay on the neutral filler tokens. */
        chrome:
          "h-7.5 gap-2 rounded-lg px-3.5 text-3xs uppercase tracking-widest focus-visible:border-gr-accent focus-visible:ring-gr-ring @max-3xl:h-8.5",
        /* `.gr-pagebtn` — the pager arrows: shorter, and the only GRAPHITE button whose
         * label is not uppercase, because it is a glyph or a number. */
        page: "h-6.5 gap-2 rounded-lg px-2.5 text-xs normal-case tracking-normal focus-visible:border-gr-accent focus-visible:ring-gr-ring",
        /* `.gr-mini` — the in-row confirm/cancel pair. Its own fill lives in the variant;
         * this only sets the geometry. */
        mini: "h-5 gap-1.5 rounded-md px-2 text-3xs uppercase tracking-widest focus-visible:border-gr-accent focus-visible:ring-gr-ring",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
