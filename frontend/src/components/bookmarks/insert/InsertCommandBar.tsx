"use client";

import { CommandBar } from "@components/ds/CommandBar";
import { MiniButton } from "@components/ds/MiniButton";
import { Overline } from "@components/ds/Overline";
import { Button } from "@components/ui/button";
import { CREATE_TEXT } from "@text/create";

/* The insert screen's command bar (COS-302): where you are, and the two ways out.
 *
 * **`cancel` confirms in place when there is something to lose**, the pattern `RecordCommandBar`
 * already uses for `delete`: the button becomes `discard? discard keep`. The handoff's `esc cancel`
 * goes through the same door, and that is the reason the pair exists — a form is one keystroke away
 * from being thrown away, and `esc` is a key people press to dismiss things that are not there. On a
 * draft nobody has typed into, both leave straight away: there is nothing to confirm.
 *
 * `commit ⌘↵` prints its shortcut because the shortcut works — the status bar has promised it since
 * DS 03, and COS-300's rule holds: a hint naming a key nothing listens for is worse than no hint.
 *
 * `flex-wrap` below the fold, as on the record: the breadcrumb and two buttons are wider than a
 * phone, and a bar that does not wrap pushes `commit` off the card. */
function InsertCommandBar({
  busy,
  confirming,
  onCancel,
  onDiscard,
  onKeep,
  onCommit,
}: {
  busy: boolean;
  confirming: boolean;
  onCancel: () => void;
  onDiscard: () => void;
  onKeep: () => void;
  onCommit: () => void;
}) {
  return (
    <CommandBar className="@max-3xl:flex-wrap @max-3xl:py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Overline className="text-gr-accent">{CREATE_TEXT.command.screen}</Overline>
        <Overline className="text-gr-fg-4">{CREATE_TEXT.command.separator}</Overline>
        <Overline className="truncate text-gr-fg-2">{CREATE_TEXT.command.draft}</Overline>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {confirming ? (
          <>
            <Overline className="text-gr-accent-2">{CREATE_TEXT.command.askDiscard}</Overline>
            <MiniButton
              danger
              onClick={onDiscard}
            >
              {CREATE_TEXT.command.discard}
            </MiniButton>
            <MiniButton onClick={onKeep}>{CREATE_TEXT.command.keep}</MiniButton>
          </>
        ) : (
          <Button
            variant="chrome"
            size="chrome"
            onClick={onCancel}
          >
            {CREATE_TEXT.command.cancel}
          </Button>
        )}

        <Button
          variant="primary"
          size="chrome"
          disabled={busy}
          onClick={onCommit}
        >
          {busy ? CREATE_TEXT.command.committing : CREATE_TEXT.command.commit}
        </Button>
      </div>
    </CommandBar>
  );
}

export { InsertCommandBar };
