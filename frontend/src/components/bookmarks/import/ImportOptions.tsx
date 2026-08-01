"use client";

import { FieldGroup } from "@components/ds/FieldGroup";
import { Segment } from "@components/ds/Segment";
import { IMPORT_TEXT } from "@text/import";

import type { ImportOptions as Options } from "@src/schemas/import";

/* `on import` (COS-303, de-mocked by COS-307) — the three switches the handoff puts under the staged
 * table.
 *
 * ⚠️ **Two of the three are live and travel with the commit.** `skip duplicates` decides what the
 * import passes over — the same `DUP` the table draws, decided server-side at commit time, because a
 * state the client sends back is a state the client could have edited. `tag as imported` puts every
 * new record under one category named `imported`, so that a file can be found again after the fact.
 *
 * ⚠️ **`capture shots` stays drawn and disabled, and its ticket is COS-329, not this one.** Nothing
 * anywhere in this application captures a screenshot from a url: the only path to that column is a
 * file the account uploads by hand. The API does not accept the flag, precisely so that no caller
 * can believe it does. Same call the account menu made for its unbuilt entries (COS-321) — shown, so
 * the row teaches what the import will one day do, and greyed rather than doing nothing when
 * pressed.
 *
 * **The lit states of the two live switches are the screen's defaults, not the handoff's picture.**
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
    <FieldGroup
      label={IMPORT_TEXT.sections.options}
      hint={IMPORT_TEXT.options.pending}
    >
      <Segment
        on={options.skipDuplicates}
        disabled={disabled}
        onClick={toggle("skipDuplicates")}
      >
        {IMPORT_TEXT.options.skipDuplicates}
      </Segment>

      <Segment
        on={false}
        disabled
      >
        {IMPORT_TEXT.options.captureShots}
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
