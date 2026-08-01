"use client";

import { Overline } from "@components/ds/Overline";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/ui/alert-dialog";
import { DELETE_TEXT } from "@text/delete";

/* `ConfirmDelete_Graphite` — the second of UI 11's two paths (COS-320).
 *
 * **Which path a delete takes is decided by what you can see when you ask for it**, and that is the
 * whole of the handoff's §10. A row in the index confirms *in place*: the line about to go is under
 * the cursor, three words at the end of it are enough, and a modal over a table would hide the very
 * thing being deleted. A record screen and an edit form show one record and no index, so there the
 * question is worth a panel that repeats the title and the url back — the two things that identify a
 * record to a person, neither of which is `record 42`.
 *
 * So this component is deliberately *not* used by `IndexRow`, which keeps `MiniButton`s and
 * `INDEX_TEXT.row.*`. Three callers, two shapes.
 *
 * ⚠️ **It stays open while the request is in flight**, which is the one place it departs from how
 * Radix's `Action` behaves out of the box. That primitive closes the dialog on click; `preventDefault`
 * in the handler suppresses it, since Radix's own `composeEventHandlers` checks `defaultPrevented`
 * before running its close. Closing on click would be the easier code and the wrong behaviour: the
 * delete is a round trip, and a modal that vanishes on press leaves the record on screen for as long
 * as the network takes, with nothing saying why. Held open, the button reads `deleting…`, and what
 * dismisses it is the caller navigating away — which only happens on success. A failed delete finds
 * the question still on screen.
 *
 * For the same reason `busy` swallows every other way out: `esc`, the backdrop and `cancel` cannot
 * take back a `DELETE` that has already been sent, so they should not appear to.
 *
 * ⚠️ **`title` used to be decoded here and `url` never was** (COS-334). Titles were stored
 * percent-encoded, and this panel exists to be recognised — an escaped title would have defeated the
 * point of showing it. The decode is gone with the encoding; the url's absence of one was never the
 * same question, since a url is already in its own escaping and unescaping one would be a second
 * bug. */
function DeleteConfirm({
  id,
  title,
  url,
  open,
  onOpenChange,
  onConfirm,
  busy = false,
}: {
  id: number | string;
  title: string;
  url?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{DELETE_TEXT.title}</AlertDialogTitle>
          {/* An `Overline`, not `AlertDialogDescription` — see the note on that component. The
              identifier is announced beside the title; the description slot belongs to the sentence
              that says what is lost. */}
          <Overline>{DELETE_TEXT.record(id)}</Overline>
        </AlertDialogHeader>

        <AlertDialogBody>
          {/* 13px in the handoff → `text-xs`, off the §3 mapping table. `text-pretty` because this
              is the one line here that can wrap to three, and a one-word last line on a record title
              reads as a rendering fault. */}
          <div className="text-pretty text-xs leading-normal text-gr-fg-2">{title}</div>

          {/* Absent rather than blank on a record with no url — a rule this screen shares with the
              index row and the record's command bar, which keep their *controls* in place for that
              case. A control holds its shape because the bar around it has one; a line of text has
              nothing to hold. */}
          {url && <div className="break-all text-2xs text-gr-fg-3">{url.replace(/^https?:\/\//, "")}</div>}

          <AlertDialogDescription className="border-t border-gr-border pt-2.5">
            {DELETE_TEXT.warning}
          </AlertDialogDescription>
        </AlertDialogBody>

        <AlertDialogFooter>
          <AlertDialogAction
            disabled={busy}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {busy ? DELETE_TEXT.footer.deleting : DELETE_TEXT.footer.confirm}
          </AlertDialogAction>
          <AlertDialogCancel disabled={busy}>{DELETE_TEXT.footer.cancel}</AlertDialogCancel>
          <Overline className="ml-auto text-gr-fg-4">{DELETE_TEXT.footer.escape}</Overline>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { DeleteConfirm };
