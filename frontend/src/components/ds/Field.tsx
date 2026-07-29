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
 * `ui/input` or `ui/textarea`, not a reimplementation of either. */
function Field({
  label,
  hint,
  multiline = false,
  className,
  id,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  hint?: React.ReactNode;
  multiline?: boolean;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div
      data-slot="field"
      className={cn("grid gap-1.25", className)}
    >
      <label
        htmlFor={fieldId}
        className="flex items-baseline gap-2"
      >
        <Overline>{label}</Overline>
        {hint != null && <Overline className="ml-auto text-gr-fg-4">{hint}</Overline>}
      </label>
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
