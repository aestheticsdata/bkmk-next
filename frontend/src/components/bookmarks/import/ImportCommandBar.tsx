"use client";

import { CommandBar } from "@components/ds/CommandBar";
import { Overline } from "@components/ds/Overline";
import { Button } from "@components/ui/button";
import { IMPORT_TEXT } from "@text/import";

/* The import screen's command bar (COS-303): what the screen accepts, and the two ways out.
 *
 * **No `discard?` pair here, unlike the insert screen.** What would be lost by leaving is a file
 * reference and a parse of it — a drag and a click to reproduce, not twenty minutes of typing. The
 * confirmation exists on the form because a draft is written by hand; asking for one here would be
 * ceremony.
 *
 * `send` is disabled until something is staged, which is also what makes the shortcut safe: `⌘↵` on
 * an empty screen has nothing to send and does nothing. */
function ImportCommandBar({
  busy,
  ready,
  onCancel,
  onSend,
}: {
  busy: boolean;
  ready: boolean;
  onCancel: () => void;
  onSend: () => void;
}) {
  return (
    <CommandBar className="@max-3xl:flex-wrap @max-3xl:py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Overline className="text-gr-accent">{IMPORT_TEXT.command.screen}</Overline>
        <Overline className="text-gr-fg-4">{IMPORT_TEXT.command.separator}</Overline>
        <Overline className="truncate text-gr-fg-2">{IMPORT_TEXT.command.formats}</Overline>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button
          variant="chrome"
          size="chrome"
          onClick={onCancel}
        >
          {IMPORT_TEXT.command.cancel}
        </Button>
        <Button
          variant="primary"
          size="chrome"
          disabled={busy || !ready}
          onClick={onSend}
        >
          {busy ? IMPORT_TEXT.command.sending : IMPORT_TEXT.command.send}
        </Button>
      </div>
    </CommandBar>
  );
}

export { ImportCommandBar };
