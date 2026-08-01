"use client";

import { FieldGroup } from "@components/ds/FieldGroup";
import { Segment } from "@components/ds/Segment";
import { IMPORT_TEXT } from "@text/import";

import type { ImportOptions as Options } from "@src/schemas/import";

/* `on import` (COS-303, de-mocked by COS-307) — the switches under the staged table.
 *
 * **Both are live and travel with the commit.** `skip duplicates` decides what the import passes
 * over — the same `DUP` the table draws, decided server-side at commit time, because a state the
 * client sends back is a state the client could have edited. `tag as imported` puts every new record
 * under one category named `imported`, so that a file can be found again after the fact.
 *
 * ⚠️ **The handoff draws three, and the third is gone** (COS-394). `capture shots` stood here drawn
 * and disabled, on the reasoning the account menu used for its unbuilt entries (COS-321): show the
 * row, so it teaches what the screen will one day do, and grey it rather than have it do nothing.
 * That reasoning depends entirely on "one day" being true. The owner has settled that screenshots
 * stay manual and cancelled the capture ticket, so the switch was teaching something that will never
 * happen — and a control that can never light up is worse than an absent one, because it reads as
 * broken rather than as out of scope. `IMPORT_TEXT.options.pending` went with it: it was the line
 * beside the caption that explained why the switch was inert.
 *
 * **The lit states of the two switches are the screen's defaults, not the handoff's picture.**
 * `skip duplicates` starts on because importing a file twice is the reason the state column exists;
 * `tag as imported` starts off, as the handoff draws it, since it writes a category the account did
 * not ask for. */
function ImportOptions({
  options,
  onChange,
  disabled,
}: {
  options: Options;
  onChange: (options: Options) => void;
  /** While the commit is in flight: the request has already left with these values. */
  disabled: boolean;
}) {
  const toggle = (key: keyof Options) => () => onChange({ ...options, [key]: !options[key] });

  return (
    <FieldGroup label={IMPORT_TEXT.sections.options}>
      <Segment
        on={options.skipDuplicates}
        disabled={disabled}
        onClick={toggle("skipDuplicates")}
      >
        {IMPORT_TEXT.options.skipDuplicates}
      </Segment>

      <Segment
        on={options.tagAsImported}
        disabled={disabled}
        onClick={toggle("tagAsImported")}
      >
        {IMPORT_TEXT.options.tagAsImported}
      </Segment>
    </FieldGroup>
  );
}

export { ImportOptions };
