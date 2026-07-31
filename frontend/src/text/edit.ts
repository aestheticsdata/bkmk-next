/* The edit surface's copy (COS-319) — the chrome around the form, and nothing else.
 *
 * **The fields keep `@text/create.ts`.** `url`, `title`, `note`, `tags`, `priority`, `stars`,
 * `alarm` and `shot` are literally the same controls here as on the insert screen — the handoff says
 * so and `bookmarks/fields/` is where they live — so their captions, placeholders and messages come
 * from that file. A second copy of the word `title` is a second thing to keep in step.
 *
 * **One form, two shells.** The same fields are rendered inside a modal over whatever screen you
 * were on, and inside a full card when the address is visited directly or reloaded. The words below
 * are shared by both; where a shell needs its own, it is named for the shell (`page.*`).
 *
 * ⚠️ **`delete record` opens the confirmation modal** (COS-320), whose words are in `@text/delete.ts`
 * — shared with the record screen, since both ask the same question about the same thing. The pair of
 * mini buttons that stood here until UI 11 landed is gone. `discard?` below is *not* the same
 * question and keeps its pair: what it throws away is the draft in the fields, which is on screen. */

export const EDIT_TEXT = {
  /** The header strip, shared by the modal and the card. */
  header: {
    title: "edit",
    record: (id: string) => `record ${id}`,
    added: (date: string) => `added ${date}`,
    /** Beside `added`, and **computed** — the draft is compared field by field with the record it
     *  was seeded from, so it appears when something really differs and goes when it is put back. */
    unsaved: "unsaved changes",
    close: "close",
  },

  footer: {
    save: "save ⌘↵",
    saving: "saving…",
    cancel: "cancel",
    /** Opens the confirmation modal, which carries the rest of the wording. */
    remove: "delete record",
    /** Leaving with changes in the form, confirmed in place — the insert screen's pattern, and
     *  `esc` and the backdrop go through the same door. */
    askDiscard: "discard?",
    discard: "discard",
    keep: "keep",
  },

  states: {
    loading: "loading record…",
    /** A valid id with nothing behind it: deleted, or never there. */
    missing: "no such record",
    error: "could not load this record",
    saveFailed: "could not save this record",
  },

  /** The full-page shell only — the modal's own chrome is the dialog's. */
  page: {
    index: "index",
    separator: "/",
  },
} as const;
