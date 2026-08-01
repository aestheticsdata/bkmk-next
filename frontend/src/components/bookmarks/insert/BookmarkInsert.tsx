"use client";

import { AlarmField } from "@components/bookmarks/fields/AlarmField";
import { PriorityField } from "@components/bookmarks/fields/PriorityField";
import { StarsField } from "@components/bookmarks/fields/StarsField";
import { TagsField } from "@components/bookmarks/fields/TagsField";
import { EMPTY_DRAFT, fieldsInError, isDirty, toInput, validateDraft } from "@components/bookmarks/draft";
import { InsertCommandBar } from "@components/bookmarks/insert/InsertCommandBar";
import { InsertPreview } from "@components/bookmarks/insert/InsertPreview";
import { Card } from "@components/ds/Card";
import { Field } from "@components/ds/Field";
import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { useBookmarkCreate } from "@src/services/useBookmarkCreate";
import { useCategoryList } from "@src/services/useCategoryList";
import { CREATE_TEXT } from "@text/create";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { BookmarkDraft } from "@components/bookmarks/draft";

/* `Create_Graphite` — the insert screen (COS-302), and the form the application already had.
 *
 * **The scope is what the legacy screen held**, repainted: title, url, categories, notes, stars,
 * priority, reminder and a screenshot. Two things leave with the repaint. `group` was a labelled row
 * printing the literal word "group", read by the controller into an empty `if (group) {}` and
 * written nowhere — a field with no column behind it and no value in front of it. And the edit mode:
 * this component's ancestor served both `/bookmarks/create` and `/bookmarks/edit/<id>` off one `id`
 * prop, which is why half of it was `useEffect`s copying a record into the form. Editing is a modal
 * now (COS-319), so this creates and only creates.
 *
 * ⚠️ **Two of the handoff's readings are still mocked, and marked where they are drawn — COS-329.**
 * The automatic capture and the title fetched from the page's `<title>` do not exist on either side
 * of the wire. They are kept as the mockup writes them rather than dropped, which is the owner's rule
 * for this redesign; the ticket that gives each one real data is named at every site. **The third,
 * the duplicate count, is real since COS-308** — see `InsertDuplicates`.
 *
 * **The five controls that are not text inputs live in `bookmarks/fields/`**, because the edit modal
 * needs exactly the same five. What is here is the layout, the draft and the commit.
 *
 * The card fills the desk (`flex-1`), unlike the record's, which hugs its content: a form's right
 * pane has a fixed slot and a readout in it whatever you have typed, so there is no empty height to
 * avoid — and the left column is meant to scroll under a pane that stays put. Below the fold the two
 * sides stack, the pane's left rule becomes a top rule, and the scrolling moves out to the desk. */
function BookmarkInsert() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookmarkDraft>(EMPTY_DRAFT);
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { categories } = useCategoryList();
  const create = useBookmarkCreate();

  /** Every control writes through this: a patch onto the draft, never a whole new object, so a field
   *  added later cannot be silently dropped by one of the handlers. The filter modal's own rule. */
  const patch = (fields: Partial<BookmarkDraft>) => setDraft((current) => ({ ...current, ...fields }));

  const parsed = validateDraft(draft);
  const invalid = parsed.success ? new Set<string>() : fieldsInError(parsed.error.issues);

  /* **Nothing is said about a field until the first commit is attempted**, and everything is said
   * from then on — the sign-up form's rule, arrived at the same way. A form that turns `title` red
   * before you have reached it is telling you off for not having finished. `submitted` is what
   * gates every message below; the check clears as soon as the field is fixed, because `invalid` is
   * recomputed on each keystroke. */
  const messageFor = (field: string, copy: string) =>
    submitted && invalid.has(field) ? <Overline className="text-gr-accent-2">{copy}</Overline> : undefined;

  const leave = () => router.push(ROUTES.bookmarks.path);

  const commit = () => {
    setSubmitted(true);
    if (!parsed.success || create.isPending) return;
    create.mutate(toInput(parsed.data, draft), { onSuccess: leave });
  };

  /** Leaving. A draft with something in it asks first — see `InsertCommandBar`. */
  const cancel = () => {
    if (isDirty(draft)) setConfirming(true);
    else leave();
  };

  /* `⌘↵ commit` and `esc cancel`, the two the status bar has printed since DS 03.
   *
   * On `window` rather than on the form, because both have to work from the pane as well — the file
   * button and the readout are outside the fields. `metaKey || ctrlKey` so the shortcut is the one
   * the keyboard actually has: the bar prints `⌘↵` and this application is developed on macOS, but
   * `ctrl` is the same gesture everywhere else and costs one condition.
   *
   * `esc` does not leave on its own: it calls the same `cancel` the button does, which arms the
   * confirmation on a draft that has anything in it. A key people press to dismiss a menu that is
   * not open must not be able to throw a form away. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        commit();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit, cancel]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col @max-3xl:flex-none @max-3xl:shrink-0">
      <InsertCommandBar
        busy={create.isPending}
        confirming={confirming}
        onCancel={cancel}
        onDiscard={leave}
        onKeep={() => setConfirming(false)}
        onCommit={commit}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_--spacing(85)] @max-3xl:grid-cols-1">
        {/* `noValidate`: the browser's own bubbles are the one piece of chrome GRAPHITE cannot style,
            and every rule they would enforce is in `CreateBookmarkPayloadSchema` already. The form
            element itself is still what makes this a form to a screen reader, and what makes the
            fields' labels mean something. */}
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            commit();
          }}
          className="gr-scroll min-h-0 overflow-y-auto px-6 py-5.5 @max-3xl:overflow-visible @max-3xl:px-3.5 @max-3xl:py-4"
        >
          <div className="grid max-w-160 content-start gap-4">
            <Field
              label={CREATE_TEXT.sections.url}
              placeholder={CREATE_TEXT.fields.urlPlaceholder}
              type="url"
              inputMode="url"
              maxLength={FIELD_LIMITS.url}
              value={draft.url}
              onChange={(event) => patch({ url: event.target.value })}
              message={messageFor("url", CREATE_TEXT.errors.url)}
              autoFocus
            />

            <Field
              label={CREATE_TEXT.sections.title}
              placeholder={CREATE_TEXT.fields.titlePlaceholder}
              maxLength={FIELD_LIMITS.title}
              value={draft.title}
              onChange={(event) => patch({ title: event.target.value })}
              message={messageFor("title", CREATE_TEXT.errors.title)}
            />

            {/* No `rows`: `ui/textarea` is `field-sizing-content` over a `min-h-16`, which is the
                handoff's three lines to start with and then as many as the note needs. A fixed row
                count would put a scrollbar inside a field on a card that has one already. */}
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

            {/* Side by side while they fit, stacked when they do not — and `flex-wrap` rather than a
                width query, for the filter modal's reason: wrapping is already conditional on the
                content not fitting, which is the question a threshold approximates. `min-w-72` is
                that modal's measured floor for a row of five segments, which is what `priority` is:
                either both halves clear 288 and neither wraps internally, or they stack full width. */}
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

            <AlarmField
              value={draft.reminder}
              onChange={(reminder) => patch({ reminder })}
            />

            {create.isError && <Overline className="text-gr-accent-2">{CREATE_TEXT.errors.submit}</Overline>}
          </div>
        </form>

        <div className="gr-scroll flex min-h-0 flex-col gap-4.5 overflow-y-auto border-l border-gr-border bg-white/10 p-5 @max-3xl:overflow-visible @max-3xl:border-t @max-3xl:border-l-0 @max-3xl:p-3.5">
          <InsertPreview
            draft={draft}
            onScreenshotChange={(screenshot) => patch({ screenshot })}
          />
        </div>
      </div>
    </Card>
  );
}

export { BookmarkInsert };
