"use client";

import { EditBody } from "@components/bookmarks/edit/EditBody";
import { EditFooter } from "@components/bookmarks/edit/EditFooter";
import { useRecordEditor } from "@components/bookmarks/edit/useRecordEditor";
import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { EDIT_TEXT } from "@text/edit";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { EditConfirm } from "@components/bookmarks/edit/EditFooter";

/* `EditModal_Graphite` — editing a record without leaving the screen you were on (COS-319).
 *
 * **It is a route, not a piece of state**, and that is the ticket's central decision. This component
 * is rendered by `app/(private)/@modal/(.)bookmarks/[id]/edit/page.tsx`, an intercepting route: the
 * address becomes `/bookmarks/42/edit`, the browser's back button closes the modal instead of
 * leaving the index, the index underneath keeps its filters and its page (they live in the query
 * string), and the address can be shared. Visited directly or reloaded, Next renders the real page
 * instead — `bookmarks/[id]/edit/page.tsx`, the same form in a card.
 *
 * ⚠️ **`open` is always true and never set false.** Closing is `router.back()`, so the route is what
 * unmounts this; a `false` here would hide a modal the URL still says is open. The price is that the
 * exit animation does not play, which is the standard trade of the pattern.
 *
 * **Every way out asks first when something has changed** — `cancel`, the `×`, `esc` and the
 * backdrop all land on the same `leave`, which arms the footer's `discard?` on a dirty form and goes
 * back on a clean one. Radix's dismissals are cancelled by `preventDefault` on the two events rather
 * than by swallowing the keystroke: its `esc` listener is on `document` in the capture phase, so a
 * `stopPropagation` from inside would run too late. The filter modal found that out first.
 *
 * `680px` → `max-w-170`, the handoff's width for this modal and one class away from `DialogContent`'s
 * 640 default, which is what that component's note said it was leaving room for. */
function EditModal({ id }: { id: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<EditConfirm>("none");

  const editor = useRecordEditor({
    id,
    onSaved: () => router.back(),
    /* Not `back()`: the record may be what you came from, and going back would land on a page for a
       record that no longer exists. `replace` also keeps the deleted record's address out of the
       history. */
    onRemoved: () => router.replace(ROUTES.bookmarks.path),
  });

  const leave = () => {
    if (editor.dirty) {
      setConfirm("discard");
      return;
    }
    router.back();
  };

  /* `⌘↵ save`. On `window` rather than on the form: the tags field swallows a bare `Enter` and the
   * footer is outside the fields, so binding it to a `<form>` would make the shortcut depend on
   * where the focus happens to be. `esc` is Radix's, handled below.
   *
   * ⚠️ **Silent while the delete confirmation is up** (COS-320). A `window` listener is not a Radix
   * layer, so it keeps firing under a dialog that has taken the focus — and `⌘↵` typed at a modal
   * asking whether to destroy this record would save it instead. The index made the same correction
   * for `⌥F` under the edit modal, and asked the DOM because the two surfaces had no shared state;
   * here `confirm` *is* that state, so the guard is exact and costs no query.
   *
   * `capture: true` for the reason the full-page shell measured and writes out at length: a guard
   * that reads render state has to run before whatever else is going to change that state in the
   * same keypress. `⌘↵` does not close anything and would survive on the bubble phase, but the two
   * shells sharing one rule is worth more than the distinction. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (confirm === "remove") return;
      if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      editor.commit();
    };

    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [editor.commit, confirm]);

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) leave();
      }}
    >
      <DialogContent
        className="max-w-170"
        showCloseButton={false}
        onEscapeKeyDown={(event) => {
          if (!editor.dirty) return;
          event.preventDefault();
          setConfirm("discard");
        }}
        onInteractOutside={(event) => {
          if (!editor.dirty) return;
          event.preventDefault();
          setConfirm("discard");
        }}
      >
        {/* ⚠️ **`flex-wrap`, not the handoff's `gr-hide-sm`.** That rule lives inside its 720px
            container query, and a portalled dialog is outside the shell's `@container` — every
            `@max-3xl:` here would evaluate false at every width, which is the trap `ui/dialog`
            already documents. Wrapping needs no query at all: the row holds `edit · record 42 ·
            added <date> · unsaved changes · ×` on one line while it fits and folds the right-hand
            group onto a second when it does not. Grouped, so the close glyph never lands alone. */}
        <DialogHeader className="flex-wrap">
          <DialogTitle>{EDIT_TEXT.header.title}</DialogTitle>
          <DialogDescription>{EDIT_TEXT.header.record(id)}</DialogDescription>

          {/* Both readings are real: the date is the record's, and `unsaved changes` is the draft
              compared field by field with the record it was seeded from. */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {editor.record?.date_added && (
              <Overline className="text-gr-fg-4">
                {EDIT_TEXT.header.added(format(editor.record.date_added, "yyyy-MM-dd"))}
              </Overline>
            )}
            {editor.dirty && <Overline className="text-gr-accent-2">{EDIT_TEXT.header.unsaved}</Overline>}
            <DialogClose
              aria-label={EDIT_TEXT.header.close}
              className="shrink-0 rounded-md text-base leading-none text-gr-fg-3 transition-colors duration-120 outline-none hover:text-gr-fg focus-visible:ring-3 focus-visible:ring-gr-ring"
            >
              <span aria-hidden>×</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <DialogBody>
          <EditBody editor={editor} />
        </DialogBody>

        <DialogFooter>
          <EditFooter
            id={id}
            title={editor.record?.title ?? ""}
            url={editor.record?.original_url}
            confirm={confirm}
            dirty={editor.dirty}
            saving={editor.saving}
            removing={editor.removing}
            onSave={editor.commit}
            onCancel={leave}
            onDiscard={() => router.back()}
            onKeep={() => setConfirm("none")}
            onAskRemove={() => setConfirm("remove")}
            onRemove={editor.destroy}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { EditModal };
