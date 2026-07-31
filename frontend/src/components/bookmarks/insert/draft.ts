import { CreateBookmarkPayloadSchema } from "@src/schemas/bookmarks";

import type { CategoryOption } from "@src/schemas/categories";
import type { Priority } from "@src/schemas/primitives";
import type { CreateBookmarkInput } from "@src/services/useBookmarkCreate";

/* The record being written (COS-302) — one object, held by the screen, patched by seven controls.
 *
 * ⚠️ **A `useState` draft rather than react-hook-form**, unlike the auth screens. Two of these fields
 * are text inputs and five are not: a row of segments, a rating, a token list and a file. Under RHF
 * each of the five is a `Controller` wrapping a control that already owns its value, which is a
 * `useState` with a form library around it — and the payload schema is a *boundary* schema, so it
 * describes the flattened object rather than the form, and would need a second one beside it to
 * resolve against. The filter modal (COS-300) has the same shape and reached the same answer.
 *
 * Every field starts empty, including `priority` and `stars`. The handoff draws `med` and four stars
 * selected on a blank form; those are its sample record, and defaulting them would put a level and a
 * rating on every bookmark whose owner never touched either control. */
type BookmarkDraft = {
  url: string;
  title: string;
  notes: string;
  categories: CategoryOption[];
  /** `""` is "no level", which is what the controller stores as `NULL`. */
  priority: Priority | "";
  stars: number;
  /** Days between two reminders, `null` when the record has no alarm. */
  reminder: number | null;
  /** The screenshot, which does not belong to the payload: it travels as a file. */
  screenshot: File | null;
};

const EMPTY_DRAFT: BookmarkDraft = {
  url: "",
  title: "",
  notes: "",
  categories: [],
  priority: "",
  stars: 0,
  reminder: null,
  screenshot: null,
};

/** Whether anything has been written into the draft — what makes `cancel` ask before leaving.
 *
 *  Compared against `EMPTY_DRAFT` field by field rather than by a `dirty` flag each control would
 *  have to set: a field typed into and then emptied again is a clean draft, and a flag would say
 *  otherwise. */
const isDirty = (draft: BookmarkDraft): boolean =>
  draft.url !== "" ||
  draft.title !== "" ||
  draft.notes !== "" ||
  draft.categories.length > 0 ||
  draft.priority !== "" ||
  draft.stars !== 0 ||
  draft.reminder !== null ||
  draft.screenshot !== null;

/** The draft as the network schema wants it, then validated by it.
 *
 *  `notes` becomes `undefined` when empty rather than `""`: the field is optional on both sides and
 *  an empty string would be stored as one. `url` stays `""`, which the schema accepts explicitly —
 *  the service is what decides not to send it. */
const validateDraft = (draft: BookmarkDraft) =>
  CreateBookmarkPayloadSchema.safeParse({
    title: draft.title.trim(),
    url: draft.url.trim(),
    notes: draft.notes.trim() || undefined,
    stars: draft.stars,
    priority: draft.priority,
    reminder: draft.reminder,
    categories: draft.categories,
  });

/** Which fields a failed validation blames, as a set of names. Only `title` and `url` can fail from
 *  the screen — the other five are chosen from controls that cannot produce an invalid value — so
 *  the message beside each one is the screen's copy rather than zod's wording. */
const fieldsInError = (issues: { path: PropertyKey[] }[]): Set<string> =>
  new Set(issues.map((issue) => String(issue.path[0])));

/** The mutation's argument: the validated payload, plus the file it does not describe. */
const toInput = (payload: Omit<CreateBookmarkInput, "screenshot">, draft: BookmarkDraft): CreateBookmarkInput => ({
  ...payload,
  screenshot: draft.screenshot,
});

export { EMPTY_DRAFT, fieldsInError, isDirty, toInput, validateDraft };

export type { BookmarkDraft };
