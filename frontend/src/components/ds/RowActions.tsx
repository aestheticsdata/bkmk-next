"use client";

import { cn } from "@lib/utils";
import { Slot } from "radix-ui";

import type * as React from "react";

/* `.gr-acts` / `.gr-act` — the open / edit / delete glyphs that appear at the right of a
 * table row on hover. Added by the v2 handoff; UI 11 (COS-320) builds the delete flow on
 * top of them.
 *
 * ⚠️ **The row owns the reveal.** These are invisible until the row is hovered, which
 * means the row must carry `group/row` — the named group is the contract between this
 * component and whatever renders the table. An unnamed `group` would also be claimed by
 * any other group ancestor, and the index has several.
 *
 * `focus-within` sits beside `group-hover` for a reason that is easy to miss: hidden by
 * opacity is still reachable by keyboard, so tabbing into a row that shows nothing would
 * move focus to an invisible button. With it, the actions appear as soon as one of them
 * takes focus.
 *
 * They stay visible below `@3xl` — there is no hover on a touch screen, so the reveal
 * would hide them permanently. */
function RowActions({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="row-actions"
      className={cn(
        "inline-flex gap-0.5 opacity-0 transition-opacity duration-120",
        "group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-within:opacity-100",
        "@max-3xl:gap-1 @max-3xl:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

/* One glyph. A real `<button>`, so it is tabbable and announces itself; `title` is the
 * label in the handoff, and every call site should pass one — the glyph alone says
 * nothing to a screen reader.
 *
 * `danger` only changes the hover colour. The action itself is not destructive: the
 * delete glyph opens a confirmation, it does not delete.
 *
 * **`asChild` for the one that navigates** (COS-299): `↗` opens the record's url, which is a link
 * and has to stay one — a button calling `window.open` loses middle-click, the context menu, and the
 * status bar preview of where it goes.
 *
 * ⚠️ **`text-lg`, not the handoff's 12px, and the box stays 22px.** None of these glyphs comes from
 * Plex Mono: `next/font` loads the `latin` subset, which stops at U+00FF bar a short list, so every
 * arrow and symbol in the app is drawn by the system fallback — and its ink is a fraction of the em.
 * Measured through CDP at 12px, `↗` inks 5.07px tall and `⌧` 4.69px, *under the 5.68px x-height* of
 * the 11px line they sit on. Fallback is not the fault by itself: the row's own `◔` and `◨` come from
 * the same place, ink 7.2px at that size and read correctly. It is these particular glyphs that draw
 * small, and the handoff's 12px was right for whatever font rendered its mockup. 18px puts `↗` at
 * 7.61px against the line's 7.68px cap height — the size the owner asked for, reached by matching ink
 * rather than em. `leading-none` keeps the 18px line box inside the 22px button; the ink is centred
 * either way, this only stops the box from outgrowing it. */
function RowAction({
  className,
  danger = false,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { danger?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      {...(asChild ? {} : { type: "button" as const })}
      data-slot="row-action"
      className={cn(
        "inline-grid size-5.5 cursor-pointer place-items-center rounded-md text-lg leading-none text-gr-fg-3 transition-colors duration-120 outline-none",
        "hover:bg-white/34 hover:text-gr-fg-2 hover:inset-shadow-gr-hair",
        "focus-visible:ring-3 focus-visible:ring-gr-ring",
        danger && "hover:text-gr-accent-2",
        "@max-3xl:size-6.5",
        className,
      )}
      {...props}
    />
  );
}

export { RowAction, RowActions };
