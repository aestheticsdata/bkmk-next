"use client";

import { cn } from "@lib/utils";

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
 * delete glyph opens a confirmation, it does not delete. */
function RowAction({ className, danger = false, ...props }: React.ComponentProps<"button"> & { danger?: boolean }) {
  return (
    <button
      type="button"
      data-slot="row-action"
      className={cn(
        "inline-grid size-5.5 cursor-pointer place-items-center rounded-md text-xs text-gr-fg-3 transition-colors duration-120 outline-none",
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
