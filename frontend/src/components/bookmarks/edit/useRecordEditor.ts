"use client";

import { fieldsInError, fromRecord, sameDraft, toInput, validateDraft } from "@components/bookmarks/draft";
import { useBookmarkRecord } from "@src/services/useBookmarkRecord";
import { useBookmarkUpdate } from "@src/services/useBookmarkUpdate";
import { useEffect, useState } from "react";

import type { BookmarkDraft } from "@components/bookmarks/draft";

/* Everything the edit form does, minus where it is drawn (COS-319).
 *
 * The modal and the full-page fallback are two shells around this one hook, which is what makes them
 * the same form rather than two forms that look alike: load the record, seed a draft from it, patch
 * it, say whether it differs, save it, delete it.
 *
 * ⚠️ **The draft is seeded once per record, not on every render of it.** `useBookmarkRecord` refetches
 * — a save invalidates it, and so does any other screen's mutation — and a seed that ran again would
 * overwrite whatever had been typed since. The guard is the id, so opening a *different* record in
 * the same mounted shell does re-seed.
 *
 * **`original` is that same seed, kept.** Dirtiness is the draft against the record as it was when
 * the form opened, not against the record as the cache holds it now; comparing with a moving target
 * is how `unsaved changes` starts flickering.
 *
 * The two navigations are the caller's, because they differ: the modal goes back, the full page goes
 * to the record it was editing. */
function useRecordEditor({
  id,
  onSaved,
  onRemoved,
}: {
  id: string;
  onSaved: () => void;
  onRemoved: () => void;
}) {
  const { record, missing, isLoading, isError, remove } = useBookmarkRecord(id);
  const [state, setState] = useState<{ id: string; original: BookmarkDraft; draft: BookmarkDraft }>();
  const [submitted, setSubmitted] = useState(false);
  const save = useBookmarkUpdate();

  useEffect(() => {
    if (!record) return;
    setState((current) => {
      if (current?.id === id) return current;
      const seed = fromRecord(record);
      return { id, original: seed, draft: seed };
    });
  }, [record, id]);

  /** Every control writes through this: a patch onto the draft, never a whole new object, so a field
   *  added later cannot be silently dropped by one of the handlers. The insert screen's own rule. */
  const patch = (fields: Partial<BookmarkDraft>) =>
    setState((current) => (current ? { ...current, draft: { ...current.draft, ...fields } } : current));

  const draft = state?.draft;
  const parsed = draft ? validateDraft(draft) : undefined;
  const invalid = parsed && !parsed.success ? fieldsInError(parsed.error.issues) : new Set<string>();
  const dirty = state ? !sameDraft(state.draft, state.original) : false;

  const commit = () => {
    setSubmitted(true);
    if (!draft || !parsed?.success || save.isPending) return;

    save.mutate(
      {
        ...toInput(parsed.data, draft),
        id: Number(id),
        /* ⚠️ **Only when the record *had* one and the form is not putting another back.** A new file
         * already replaces the server's capture, and sending the flag beside it would ask the
         * controller to delete the file it has just been given. */
        deleteScreenshot: Boolean(record?.screenshot) && draft.captured === null && draft.screenshot === null,
      },
      { onSuccess: onSaved },
    );
  };

  const destroy = () => {
    if (remove.isPending) return;
    remove.mutate(undefined, { onSuccess: onRemoved });
  };

  return {
    record,
    draft,
    patch,
    dirty,
    /** Nothing is said about a field until the first save is attempted, and everything is from then
     *  on — the insert screen's rule, arrived at the same way. */
    submitted,
    invalid,
    isLoading,
    isError,
    missing,
    saving: save.isPending,
    saveFailed: save.isError,
    removing: remove.isPending,
    commit,
    destroy,
  };
}

export { useRecordEditor };
