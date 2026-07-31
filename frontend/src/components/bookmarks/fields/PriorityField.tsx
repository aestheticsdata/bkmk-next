"use client";

import { PRIORITY_SEGMENTS } from "@components/bookmarks/fields/constants";
import { FieldGroup } from "@components/ds/FieldGroup";
import { Segment } from "@components/ds/Segment";
import { CREATE_TEXT } from "@text/create";

import type { Priority } from "@src/schemas/primitives";

/* `priority` as a row of segments (COS-302) — the handoff's control, and the first of the five
 * shared with the edit modal (COS-319).
 *
 * A single choice drawn as `aria-pressed` toggles rather than as radios, which is the filter modal's
 * precedent for the same shape: `Segment` is the vocabulary the whole system picks values in, and
 * one row that behaves like every other row is worth more here than the arrow-key navigation a
 * radiogroup would add.
 *
 * Clicking the segment that is already on sets `—`, so the field can be emptied without hunting for
 * the dash — the same gesture the filter modal's star row uses to go back to `any`. */
function PriorityField({
  value,
  onChange,
  className,
}: {
  value: Priority | "";
  onChange: (value: Priority | "") => void;
  className?: string;
}) {
  return (
    <FieldGroup
      label={CREATE_TEXT.sections.priority}
      className={className}
    >
      {PRIORITY_SEGMENTS.map((level) => (
        <Segment
          key={level || "unset"}
          on={value === level}
          onClick={() => onChange(value === level ? "" : level)}
        >
          {level || CREATE_TEXT.fields.unset}
        </Segment>
      ))}
    </FieldGroup>
  );
}

export { PriorityField };
