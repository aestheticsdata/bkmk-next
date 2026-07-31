/* The delete confirmation's copy (COS-320). Same convention as the other `@text/` files: the words
 * live here, in English, with no locale segment.
 *
 * ⚠️ **Its own file rather than a block inside `@text/record.ts` or `@text/edit.ts`**, because the
 * surface belongs to neither: the record's command bar and both shells of the edit form open the
 * same modal, and a second copy of the warning sentence is a second sentence to keep true. The
 * fields did the same thing in the other direction — the edit form borrows `@text/create.ts` rather
 * than restating eight captions.
 *
 * ⚠️ **The index row is not a caller and keeps its own words** (`INDEX_TEXT.row.*`). That is the
 * ticket's split, not an oversight: deleting from a row is confirmed *in place*, in three words at
 * 10px, because you are looking straight at the line that is about to go. The modal is for the two
 * surfaces where you are not — a record screen and an edit form both show one record and neither
 * shows it disappearing from the index. */

export const DELETE_TEXT = {
  /** The header strip: the warning as a title, then which record is being asked about. */
  title: "delete",
  record: (id: number | string) => `record ${id}`,

  /** The body's last line, and what Radix announces as the dialog's description. It enumerates what
   *  leaves with the row because none of it is visible from here — the note, the tags, the
   *  screenshot and the alarm are four separate things a record owns, and "delete this record?"
   *  alone does not say that the screenshot goes too. */
  warning: "note, tags, screenshot and alarm go with it. the entry is removed from the index — this cannot be undone.",

  footer: {
    /** The filled-oxide button, and the only one in the system that destroys on a single press —
     *  which it has earned by being behind a modal. */
    confirm: "delete record",
    /** While the request is in flight. Same shape as the edit footer's `saving…`. */
    deleting: "deleting…",
    cancel: "cancel",
    /** Right-aligned, and it states something that is true: Radix closes the topmost layer on
     *  escape, and this modal is always the topmost when it is open. */
    escape: "esc cancels",
  },
} as const;
