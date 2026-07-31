"use client";

import { ALARM_FREQUENCIES } from "@components/bookmarks/fields/constants";
import { FieldGroup } from "@components/ds/FieldGroup";
import { Segment } from "@components/ds/Segment";
import { CREATE_TEXT } from "@text/create";

/* `alarm` as a row of segments (COS-302). Same control and same reasoning as `PriorityField`; the
 * difference is what the values mean.
 *
 * **The hint says `every`, and it is the whole field.** The handoff's `T-1d · T-3d · T-7d` reads as
 * a countdown, and `1d` on its own would read the same way — but the record's alarm is a repeat
 * interval (see `ALARM_FREQUENCIES`). One word in the header row is what keeps the segments from
 * promising a deadline; the record screen spends a whole sentence on it (`armed · every 5d`).
 *
 * `off` is `null` rather than `0`: no alarm means no row in the `alarm` table, and on an edit it is
 * what deletes the one that was there. */
function AlarmField({
  value,
  onChange,
  className,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}) {
  return (
    <FieldGroup
      label={CREATE_TEXT.sections.alarm}
      hint={value == null ? undefined : CREATE_TEXT.fields.alarmHint}
      className={className}
    >
      <Segment
        on={value == null}
        onClick={() => onChange(null)}
      >
        {CREATE_TEXT.fields.alarmOff}
      </Segment>
      {ALARM_FREQUENCIES.map((days) => (
        <Segment
          key={days}
          on={value === days}
          onClick={() => onChange(value === days ? null : days)}
        >
          {CREATE_TEXT.fields.alarmDays(days)}
        </Segment>
      ))}
    </FieldGroup>
  );
}

export { AlarmField };
