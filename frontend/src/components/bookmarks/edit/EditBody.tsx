"use client";

import { EditFields } from "@components/bookmarks/edit/EditFields";
import { Overline } from "@components/ds/Overline";
import { EDIT_TEXT } from "@text/edit";

import type { useRecordEditor } from "@components/bookmarks/edit/useRecordEditor";

/** What goes between the header and the footer, in either shell (COS-319): the four states the
 *  record can be in before there is a form, and the form.
 *
 *  The states read as one centred line, like the index table's and the record screen's. A skeleton
 *  of eight fake fields would be a bigger lie than a word, and this one resolves in a request. */
function EditBody({ editor }: { editor: ReturnType<typeof useRecordEditor> }) {
  if (editor.isLoading) return <Placeholder>{EDIT_TEXT.states.loading}</Placeholder>;
  if (editor.isError) return <Placeholder tone="danger">{EDIT_TEXT.states.error}</Placeholder>;
  if (editor.missing) return <Placeholder>{EDIT_TEXT.states.missing}</Placeholder>;
  if (!editor.draft) return null;

  return (
    <>
      <EditFields
        draft={editor.draft}
        submitted={editor.submitted}
        invalid={editor.invalid}
        patch={editor.patch}
      />
      {editor.saveFailed && <Overline className="text-gr-accent-2">{EDIT_TEXT.states.saveFailed}</Overline>}
    </>
  );
}

function Placeholder({ children, tone }: { children: string; tone?: "danger" }) {
  return (
    <div className="flex h-20 items-center justify-center">
      <Overline className={tone === "danger" ? "text-gr-accent-2" : undefined}>{children}</Overline>
    </div>
  );
}

export { EditBody };
