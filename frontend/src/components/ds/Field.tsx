"use client";

import { Overline } from "@components/ds/Overline";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { cn } from "@lib/utils";
import { useId } from "react";

import type * as React from "react";

/* A labelled field: the overline caption above, the control below. The filter modal, the
 * edit modal and the create form are almost entirely made of these.
 *
 * This is the one place the handoff's markup is worth *not* copying. It writes the
 * caption and the input as two siblings with no relationship — visually fine, and
 * unusable with a screen reader, which reads an unlabelled text box. Here the id is
 * generated and the `<label>` bound, so the caption is the field's accessible name.
 *
 * `useId` rather than a required prop: a caller that has to invent unique ids will
 * eventually reuse one, and a duplicated id silently sends clicks to the wrong field.
 * Passing `id` explicitly still wins, for the cases where a form library owns it.
 *
 * The composite is what earns its place in `ds/` — the control underneath is plain
 * `ui/input` or `ui/textarea`, not a reimplementation of either.
 *
 * **The header row holds three things besides the label, and where each sits is the point**
 * (COS-298).
 *
 * `hint` goes **inside** the `<label>`: a hint belongs to the field's accessible name, and "key,
 * 12+ chars" is a better name than "key". `action` and `message` go **outside** it. A `<button>`
 * nested in a `<label>` puts an interactive element inside another element's name and a click on it
 * also activates the label; a message is a description, not a name, and it changes as you type — a
 * name that rewrites itself under a screen reader is worse than no hint at all.
 *
 * **`message` is in this row and not under the control.** Below the field it would need a reserved
 * line at every field, or the card grows as you tab through it and the submit slides out from under
 * the pointer. Reserving costs ~22px per field, which on a card whose whole character is condensed
 * reads as a layout bug — it was built that way once and it was wrong. Up here the row already
 * exists: the message costs nothing, lands where the eye already is, and the card never moves. The
 * price is that messages must fit the room left beside the label, which is why the schemas keep
 * them to two or three words.
 *
 * A control in `action` **may be taller than the row** — the sign-up screen's `show` toggle is a
 * 20px `MiniButton` in this 16px row, centred, overflowing two pixels each way into the gap above
 * the control. What it must not do is *change* the row's height, which is why the height is set
 * below rather than left to whatever the row happens to contain. */
function Field({
  label,
  hint,
  action,
  message,
  multiline = false,
  className,
  id,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  hint?: React.ReactNode;
  /** A control belonging to the field — the sign-up screen's `show` toggle. Pushed right. */
  action?: React.ReactNode;
  /** A validation message, beside the label rather than under the control. See above. */
  message?: React.ReactNode;
  multiline?: boolean;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div
      data-slot="field"
      className={cn("grid gap-1.5", className)}
    >
      {/* **`h-4 leading-4 items-center`, and all three are load-bearing.** Two fields side by side
          have to put their labels *and* their inputs at the same height, and **baseline alignment
          cannot promise either**: each header is its own flex container, so the shared baseline is
          set by whichever child has the greatest ascent — add a control to one column and that
          column's text and input both shift. Two versions went wrong that way.
          So: the row is exactly one line tall, `leading-4` forces every child's line box to that
          same 16px, and centring 16px boxes in a 16px row puts them at an identical offset whatever
          the row contains — including a control taller than the row, which overflows rather than
          stretching it. */}
      <div className="flex h-4 items-center gap-2 leading-4">
        <label
          htmlFor={fieldId}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          {/* Never wrapped. A header that folds to two lines in one column of a pair drops that
              column's input below its neighbour's, which is the misalignment this row exists to
              avoid — better to run out of room and clip than to move the field. */}
          <Overline className="whitespace-nowrap">{label}</Overline>
          {hint != null && <Overline className="ml-auto whitespace-nowrap text-gr-fg-4">{hint}</Overline>}
        </label>
        {message}
        {/* No wrapper. Wrapping `action` in a `<span>` gave it a strut at the *card's* font size —
            12px in a row of 10px labels — which is what made the row taller. The caller's control
            carries its own `ml-auto`. */}
        {action}
      </div>
      {multiline ? (
        <Textarea
          id={fieldId}
          {...(props as React.ComponentProps<typeof Textarea>)}
        />
      ) : (
        <Input
          id={fieldId}
          {...props}
        />
      )}
    </div>
  );
}

export { Field };
