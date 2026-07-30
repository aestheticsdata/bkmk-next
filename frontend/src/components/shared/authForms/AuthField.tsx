"use client";

import { Field } from "@components/ds/Field";
import { Overline } from "@components/ds/Overline";

import type * as React from "react";

/* A `ds/Field` with its validation message underneath, wired to it (COS-298).
 *
 * This exists because the wiring is the part that gets forgotten. An error rendered next to an
 * input is decoration unless `aria-describedby` points at it and `aria-invalid` marks the control,
 * and doing that by hand at every field — five of them on the sign-up screen — is five chances to
 * get it wrong. Here the ids derive from one required `id`, so the pair cannot come apart.
 *
 * `id` is required, unlike on `ds/Field` where `useId` covers callers that have none: the error
 * needs a stable id built from the field's, and a generated one is not visible from out here. */
function AuthField({
  id,
  error,
  ...props
}: React.ComponentProps<typeof Field> & {
  id: string;
  /** `errors.<name>?.message` from react-hook-form. */
  error?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <Field
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <Overline
          id={errorId}
          className="mt-1.5 block text-gr-accent-2"
        >
          {error}
        </Overline>
      )}
    </div>
  );
}

export { AuthField };
