"use client";

import { MiniButton } from "@components/ds/MiniButton";
import { Overline } from "@components/ds/Overline";
import { Button } from "@components/ui/button";
import { EDIT_TEXT } from "@text/edit";

/** Which question the footer is asking, if any. It lives in the shell rather than here because two
 *  of the three ways to arm `discard` are outside this component — `esc` and the backdrop. */
type EditConfirm = "none" | "discard" | "remove";

/* The footer of the edit form (COS-319): save, leave, and delete — the handoff's three, in its
 * order, with `delete record` pushed right.
 *
 * **Both destructive answers are asked in place**, and neither is a modal. `discard?` is the insert
 * screen's pair, reached from `cancel`, from `esc` and from a click on the backdrop, and armed only
 * when something has actually changed — a form you opened and did not touch closes on the first
 * press. `delete?` is the record command bar's pair, and UI 11 (COS-320) is what replaces it with
 * the confirmation the handoff draws, where the title and url are repeated back.
 *
 * ⚠️ **`delete` stays reachable while `discard?` is up, and that is deliberate**: the two questions
 * are about different things, and hiding one behind the other would make "I want this record gone"
 * take three clicks and a decision about unsaved edits that are about to stop existing. */
function EditFooter({
  confirm,
  dirty,
  saving,
  removing,
  onSave,
  onCancel,
  onDiscard,
  onKeep,
  onAskRemove,
  onRemove,
}: {
  confirm: EditConfirm;
  dirty: boolean;
  saving: boolean;
  removing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onDiscard: () => void;
  onKeep: () => void;
  onAskRemove: () => void;
  onRemove: () => void;
}) {
  return (
    <>
      {confirm === "discard" ? (
        <div className="flex items-center gap-2.5">
          <Overline className="text-gr-accent-2">{EDIT_TEXT.footer.askDiscard}</Overline>
          <MiniButton
            danger
            onClick={onDiscard}
          >
            {EDIT_TEXT.footer.discard}
          </MiniButton>
          <MiniButton onClick={onKeep}>{EDIT_TEXT.footer.keep}</MiniButton>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          {/* Disabled on a form nothing has changed: there is no save to make, and a primary button
              that answers a press with a network round trip and no visible result reads as broken. */}
          <Button
            variant="primary"
            size="chrome"
            disabled={saving || !dirty}
            onClick={onSave}
          >
            {saving ? EDIT_TEXT.footer.saving : EDIT_TEXT.footer.save}
          </Button>
          <Button
            variant="chrome"
            size="chrome"
            onClick={onCancel}
          >
            {EDIT_TEXT.footer.cancel}
          </Button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2.5">
        {confirm === "remove" ? (
          <>
            <Overline className="text-gr-accent-2">{EDIT_TEXT.footer.askRemove}</Overline>
            <MiniButton
              danger
              disabled={removing}
              onClick={onRemove}
            >
              {EDIT_TEXT.footer.confirm}
            </MiniButton>
            <MiniButton onClick={onKeep}>{EDIT_TEXT.footer.keepRecord}</MiniButton>
          </>
        ) : (
          <Button
            variant="danger"
            size="chrome"
            onClick={onAskRemove}
          >
            {EDIT_TEXT.footer.remove}
          </Button>
        )}
      </div>
    </>
  );
}

export { EditFooter };

export type { EditConfirm };
