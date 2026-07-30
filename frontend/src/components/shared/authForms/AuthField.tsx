"use client";

import { Field } from "@components/ds/Field";
import { Overline } from "@components/ds/Overline";

import type * as React from "react";

/* A `ds/Field` with its validation message wired to it (COS-298).
 *
 * This exists because the wiring is the part that gets forgotten. A message rendered next to an
 * input is decoration unless `aria-describedby` points at it and `aria-invalid` marks the control,
 * and doing that by hand at every field — five of them on the sign-up screen — is five chances to
 * get it wrong. Here the ids derive from one required `id`, so the pair cannot come apart.
 *
 * **The message goes in the label row, and adds no height.** The first version put it under the
 * control, which grew the card as you tabbed through it; reserving a line for it instead grew the
 * card permanently, by about 22px a field. Both are wrong on a design this condensed. The label row
 * already exists and already has room at its right end, so the message lands there and the card
 * never moves. It replaces the hint while it shows: they occupy the same spot, and a hint about the
 * rule you just broke is not worth the collision.
 *
 * `id` is required, unlike on `ds/Field` where `useId` covers callers that have none: the message
 * needs a stable id built from the field's, and a generated one is not visible from out here. */
function AuthField({
  id,
  error,
  hint,
  ...props
}: React.ComponentProps<typeof Field> & {
  id: string;
  /** `errors.<name>?.message` from react-hook-form. */
  error?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <Field
      id={id}
      hint={error ? undefined : hint}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      message={
        error && (
          <Overline
            id={errorId}
            className="truncate whitespace-nowrap text-gr-accent-2"
          >
            {error}
          </Overline>
        )
      }
      {...props}
    />
  );
}

export { AuthField };
