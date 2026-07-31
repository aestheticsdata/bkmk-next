"use client";

import { EditBody } from "@components/bookmarks/edit/EditBody";
import { EditFooter } from "@components/bookmarks/edit/EditFooter";
import { useRecordEditor } from "@components/bookmarks/edit/useRecordEditor";
import { Card } from "@components/ds/Card";
import { CommandBar, PagerBar } from "@components/ds/CommandBar";
import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import { EDIT_TEXT } from "@text/edit";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { EditConfirm } from "@components/bookmarks/edit/EditFooter";

/* The edit form as a screen (COS-319) — the other half of the interception.
 *
 * ⚠️ **This route did not disappear, it changed jobs.** PLAT 01 announced that `bookmarks/edit/[id]`
 * would be deleted once editing became a modal; parallel routes mean the opposite. Next renders the
 * intercepted modal only on a *client* navigation from inside the application. Open
 * `/bookmarks/42/edit` in a new tab, reload it, or follow it from a bookmark, and there is no page
 * underneath to lay a modal over — so this is what renders, and the address keeps working. The path
 * moved with the job: `/bookmarks/edit/42` → `/bookmarks/42/edit`, which is where an interception
 * can sit beside the record it belongs to.
 *
 * **The same form, in a card.** `useRecordEditor`, `EditBody` and `EditFooter` are shared with the
 * modal down to the confirmations; what is written here is a command bar, a scroller and a pager
 * bar, because a screen has those and a dialog has its own.
 *
 * ⚠️ **The card is capped at the modal's own 680px and centred, rather than filling the desk.** It
 * is the same panel with no page behind it, and it should read as one; a full-width card would put
 * a 640px column of fields against 760px of empty grey — the arrangement the owner rejected on the
 * record screen, measured there at 511px of blank. Hugging its content rather than stretching is the
 * same call: the desk scrolls when the form is taller than it. */
function BookmarkEdit({ id }: { id: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<EditConfirm>("none");

  const record = `${ROUTES.bookmarksRecord.path}/${id}`;

  const editor = useRecordEditor({
    id,
    onSaved: () => router.push(record),
    onRemoved: () => router.push(ROUTES.bookmarks.path),
  });

  /* `router.push`, not `back()`: this screen is what a *direct* visit renders, so there may be no
     history behind it — and the record is where the edit came from conceptually either way. */
  const leave = () => {
    if (editor.dirty) {
      setConfirm("discard");
      return;
    }
    router.push(record);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        editor.commit();
        return;
      }
      /* `esc` goes through `leave`, not straight out: a key people press to dismiss a menu that is
         not open must not be able to throw away a form. Same rule as the insert screen. */
      if (event.key === "Escape") {
        event.preventDefault();
        leave();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor.commit, leave]);

  return (
    <Card className="flex w-full max-w-170 shrink-0 flex-col self-center">
      <CommandBar className="@max-3xl:flex-wrap @max-3xl:py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Overline
            asChild
            className="text-gr-accent transition-colors duration-120 outline-none hover:text-gr-fg-2 focus-visible:ring-3 focus-visible:ring-gr-ring"
          >
            <Link href={ROUTES.bookmarks.path}>{EDIT_TEXT.page.index}</Link>
          </Overline>
          <Overline className="text-gr-fg-4">{EDIT_TEXT.page.separator}</Overline>
          <Overline className="truncate text-gr-fg-2">{EDIT_TEXT.header.record(id)}</Overline>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {editor.record?.date_added && (
            <Overline className="text-gr-fg-4 @max-3xl:hidden">
              {EDIT_TEXT.header.added(format(editor.record.date_added, "yyyy-MM-dd"))}
            </Overline>
          )}
          {editor.dirty && <Overline className="text-gr-accent-2">{EDIT_TEXT.header.unsaved}</Overline>}
        </div>
      </CommandBar>

      <div className="grid content-start gap-4 px-5 py-4.5 @max-3xl:px-3.5 @max-3xl:py-4">
        <EditBody editor={editor} />
      </div>

      <PagerBar className="@max-3xl:flex-wrap">
        <EditFooter
          confirm={confirm}
          dirty={editor.dirty}
          saving={editor.saving}
          removing={editor.removing}
          onSave={editor.commit}
          onCancel={leave}
          onDiscard={() => router.push(record)}
          onKeep={() => setConfirm("none")}
          onAskRemove={() => setConfirm("remove")}
          onRemove={editor.destroy}
        />
      </PagerBar>
    </Card>
  );
}

export { BookmarkEdit };
