"use client";

import { AlarmField } from "@components/bookmarks/fields/AlarmField";
import { PriorityField } from "@components/bookmarks/fields/PriorityField";
import { ShotField } from "@components/bookmarks/fields/ShotField";
import { StarsField } from "@components/bookmarks/fields/StarsField";
import { TagsField } from "@components/bookmarks/fields/TagsField";
import { Field } from "@components/ds/Field";
import { Overline } from "@components/ds/Overline";
import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { useCategoryList } from "@src/services/useCategoryList";
import { CREATE_TEXT } from "@text/create";

import type { BookmarkDraft } from "@components/bookmarks/draft";

/* The record's fields, prefilled (COS-319) — the body of the modal and of the full-page fallback,
 * written once.
 *
 * ⚠️ **Every control here is the insert screen's**, imported from `bookmarks/fields/` where COS-302
 * put them for exactly this. The ticket's instruction was to extract rather than duplicate, and what
 * is left in this file is the *arrangement*: url, title, note, tags, then the handoff's two pairs —
 * `priority` / `stars` and `alarm` / `shot`.
 *
 * **The pairs wrap rather than answering a width query**, the insert screen's call and the filter
 * modal's before it: wrapping is already conditional on the content not fitting, which is the
 * question a threshold approximates. It matters more here than anywhere — this form is rendered
 * inside a 680px modal *and* inside a card as wide as the desk, and a container query would measure
 * neither (a portalled dialog is outside the shell's `@container` altogether).
 *
 * `min-w-72` is the filter modal's measured floor for a row of five segments, which is what
 * `priority` is: either both halves clear 288 and neither wraps internally, or they stack full
 * width. */
function EditFields({
  draft,
  submitted,
  invalid,
  patch,
}: {
  draft: BookmarkDraft;
  submitted: boolean;
  invalid: Set<string>;
  patch: (fields: Partial<BookmarkDraft>) => void;
}) {
  const { categories } = useCategoryList();

  const messageFor = (field: string, copy: string) =>
    submitted && invalid.has(field) ? <Overline className="text-gr-accent-2">{copy}</Overline> : undefined;

  return (
    <>
      <Field
        label={CREATE_TEXT.sections.url}
        placeholder={CREATE_TEXT.fields.urlPlaceholder}
        type="url"
        inputMode="url"
        maxLength={FIELD_LIMITS.url}
        value={draft.url}
        onChange={(event) => patch({ url: event.target.value })}
        message={messageFor("url", CREATE_TEXT.errors.url)}
      />

      {/* The focus lands here rather than on `url`: the title is the field an edit is most often
          opened for, and it is the one that cannot be empty. */}
      <Field
        label={CREATE_TEXT.sections.title}
        placeholder={CREATE_TEXT.fields.titlePlaceholder}
        maxLength={FIELD_LIMITS.title}
        value={draft.title}
        onChange={(event) => patch({ title: event.target.value })}
        message={messageFor("title", CREATE_TEXT.errors.title)}
        autoFocus
      />

      <Field
        multiline
        label={CREATE_TEXT.sections.note}
        placeholder={CREATE_TEXT.fields.notePlaceholder}
        maxLength={FIELD_LIMITS.notes}
        value={draft.notes}
        onChange={(event) => patch({ notes: event.target.value })}
      />

      <TagsField
        value={draft.categories}
        categories={categories}
        onChange={(next) => patch({ categories: next })}
      />

      <div className="flex flex-wrap gap-4">
        <PriorityField
          className="min-w-72 flex-1"
          value={draft.priority}
          onChange={(priority) => patch({ priority })}
        />
        <StarsField
          className="min-w-72 flex-1"
          value={draft.stars}
          onChange={(stars) => patch({ stars })}
        />
      </div>

      {/* ⚠️ **`shot` is a field here, and a right-hand pane on the insert screen.** That screen has a
          pane — a live preview of the record being written — and the 146px slot belongs in it. This
          form is one column, so the handoff pairs the capture with `alarm` and reduces it to a state
          and a button: `compact`. */}
      <div className="flex flex-wrap gap-4">
        <AlarmField
          className="min-w-72 flex-1"
          value={draft.reminder}
          onChange={(reminder) => patch({ reminder })}
        />
        <ShotField
          compact
          className="min-w-72 flex-1 content-start"
          file={draft.screenshot}
          captured={draft.captured}
          onChange={(screenshot) => patch({ screenshot })}
          onDropCaptured={() => patch({ captured: null })}
        />
      </div>
    </>
  );
}

export { EditFields };
