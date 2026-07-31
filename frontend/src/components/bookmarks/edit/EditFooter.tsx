"use client";

import { DeleteConfirm } from "@components/bookmarks/DeleteConfirm";
import { MiniButton } from "@components/ds/MiniButton";
import { Overline } from "@components/ds/Overline";
import { Button } from "@components/ui/button";
import { EDIT_TEXT } from "@text/edit";

/** Which question the footer is asking, if any. It lives in the shell rather than here because two
 *  of the three ways to arm `discard` are outside this component — `esc` and the backdrop — and
 *  because both shells silence their own keyboard shortcuts while `remove` is up (see either file). */
type EditConfirm = "none" | "discard" | "remove";

/* The footer of the edit form (COS-319): save, leave, and delete — the handoff's three, in its
 * order, with `delete record` pushed right.
 *
 * ⚠️ **The two destructive answers are asked in two different ways, and that is the point of UI 11**
 * (COS-320). `discard?` is still the in-place pair: what it throws away is the edits sitting in the
 * fields right in front of you, it is reached from `cancel`, from `esc` and from the backdrop, and it
 * is armed only when something has actually changed — a form you opened and did not touch closes on
 * the first press. `delete record` now opens the confirmation modal, because what *it* throws away is
 * not on this screen: the note, the tags, the screenshot and the alarm are a record's, not a draft's,
 * and the modal is where they are named and where the title and url are read back.
 *
 * The pair of mini buttons that stood in for it was written as the smaller thing to throw away, and
 * this is it being thrown away.
 *
 * ⚠️ **`delete` stays reachable while `discard?` is up, and that is deliberate**: the two questions
 * are about different things, and hiding one behind the other would make "I want this record gone"
 * take three clicks and a decision about unsaved edits that are about to stop existing. Pressing it
 * moves `confirm` from `discard` to `remove`, so the in-place pair steps aside for the modal — one
 * question on screen at a time, and the one you just asked for.
 *
 * The modal is rendered here rather than in the two shells for the reason the whole file exists: the
 * card and the dialog are two frames around one form, and a confirmation that lived in each would be
 * two confirmations to keep in step. It portals to `document.body` from either. */
function EditFooter({
  id,
  title,
  url,
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
  id: string;
  title: string;
  url?: string | null;
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
        {/* Outline oxide: it asks, it does not delete. The filled one is in the modal. */}
        <Button
          variant="danger"
          size="chrome"
          onClick={onAskRemove}
        >
          {EDIT_TEXT.footer.remove}
        </Button>
      </div>

      {/* ⚠️ **Above the edit modal, not inside it** — the panel is at `z-50` and this pair is at
          52 / 53 (see `ui/alert-dialog`). It is the one surface in the app that opens over another
          portalled one, which is why that file carries a layer of its own instead of relying on
          Radix appending the second portal after the first. */}
      <DeleteConfirm
        id={id}
        title={title}
        url={url}
        open={confirm === "remove"}
        onOpenChange={(next) => {
          if (!next) onKeep();
        }}
        onConfirm={onRemove}
        busy={removing}
      />
    </>
  );
}

export { EditFooter };

export type { EditConfirm };
