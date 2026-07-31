"use client";

import { FieldGroup } from "@components/ds/FieldGroup";
import { Segment } from "@components/ds/Segment";
import { IMPORT_TEXT } from "@text/import";

/** The handoff's three, with the two it draws lit. Kept as data so the de-mock ticket has one line
 *  to change when the options start travelling with the request. */
const OPTIONS = [
  { key: "skipDuplicates", label: IMPORT_TEXT.options.skipDuplicates, on: true },
  { key: "captureShots", label: IMPORT_TEXT.options.captureShots, on: true },
  { key: "tagAsImported", label: IMPORT_TEXT.options.tagAsImported, on: false },
] as const;

/* `on import` (COS-303) — the three switches the handoff puts under the staged table.
 *
 * ⚠️ **All three are mocked, and all three are disabled — COS-307.** None of them exists on either
 * side: `POST /bookmarks/upload` takes a file and imports every line of it, there is no duplicate
 * check to skip, no capture pipeline to trigger, and no tag to apply.
 *
 * **Drawn rather than hidden, greyed rather than live**, which is the call the account menu made for
 * its three unbuilt entries (COS-321): the row is also how you learn what the import will one day
 * do, and the one thing worse than a missing control is one that does nothing when pressed. Their
 * lit states are the handoff's, so the row looks like the design rather than like three switches
 * somebody left off.
 *
 * The `not wired yet` beside the caption says it once. Three disabled pills each carrying their own
 * explanation would be three times the words for one fact. */
function ImportOptions() {
  return (
    <FieldGroup
      label={IMPORT_TEXT.sections.options}
      hint={IMPORT_TEXT.options.pending}
    >
      {OPTIONS.map((option) => (
        <Segment
          key={option.key}
          on={option.on}
          disabled
        >
          {option.label}
        </Segment>
      ))}
    </FieldGroup>
  );
}

export { ImportOptions };
