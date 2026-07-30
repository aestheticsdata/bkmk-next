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
 * `hint` sits **inside** the label and `action` **outside** it, and the difference matters
 * (COS-298). A hint is part of the field's accessible name, which is what you want: "key,
 * 12+ chars" is a better name than "key". A control is not — a `<button>` nested in a
 * `<label>` puts an interactive element inside another element's name, and a click on it
 * also activates the label. So `action` is a sibling of the label, inside a header row that
 * exists only to hold them side by side. */
function Field({
  label,
  hint,
  action,
  multiline = false,
  className,
  id,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  hint?: React.ReactNode;
  /** A control belonging to the field — the sign-up screen's `show` toggle. Pushed right. */
  action?: React.ReactNode;
  multiline?: boolean;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div
      data-slot="field"
      className={cn("grid gap-1.25", className)}
    >
      <div className="flex items-baseline gap-2">
        <label
          htmlFor={fieldId}
          className="flex flex-1 items-baseline gap-2"
        >
          <Overline>{label}</Overline>
          {hint != null && <Overline className="ml-auto text-gr-fg-4">{hint}</Overline>}
        </label>
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
