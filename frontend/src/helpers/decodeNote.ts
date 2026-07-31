/** A note as it was typed, from a note as it is stored.
 *
 *  Notes go into the database percent-encoded — the legacy form did it, `useBookmarkCreate` kept
 *  doing it because that is how every existing row is written, and the record screen has undone it
 *  since COS-301. This is that decode, lifted out of `RecordNote` when the edit modal needed the
 *  same text in a field (COS-319).
 *
 *  ⚠️ **The `try` is the whole point.** `decodeURIComponent` throws on a `%` that is not an escape —
 *  a note written before the form encoded them, or one that simply says `100%`. The raw text is the
 *  right answer then, and an exception would take the screen with it. */
function decodeNote(note?: string | null): string {
  if (!note) return "";
  try {
    return decodeURIComponent(note);
  } catch {
    return note;
  }
}

export { decodeNote };
