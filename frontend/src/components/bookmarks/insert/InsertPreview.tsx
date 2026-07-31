"use client";

import { ShotField } from "@components/bookmarks/fields/ShotField";
import { Overline } from "@components/ds/Overline";
import { CREATE_TEXT } from "@text/create";

import type { BookmarkDraft } from "@components/bookmarks/insert/draft";

/** The url's host, which is the one thing in the readout that is not simply echoed back.
 *
 *  `URL` throws on anything incomplete, and everything is incomplete while you are typing one — so a
 *  failure here means "not yet", not "wrong". The field says `not a url` on commit; this says `…`.
 *
 *  `null` is "no url at all", `undefined` is "not one yet": two empty states with two readings. */
function hostOf(url: string): string | null | undefined {
  if (url.trim() === "") return null;
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

/* The right pane (COS-302): the screenshot, what the record will look like, and the duplicate
 * warning.
 *
 * **`record preview` is computed, not mocked.** Every line of it is on the left column already —
 * which is exactly why it earns its place on a *form*: it is the record as the index will hold it,
 * one field per line, while the controls that produce it are seven differently-shaped widgets. The
 * record screen's own pane dropped two of its three blocks (COS-301) because they had no data; this
 * one has all of it.
 *
 * `id` is the exception, and it prints `—` on every draft: the identifier is what the insert
 * returns, so before the commit there is genuinely nothing to show. The handoff's `id 2088` is the
 * number of a record that already exists. That is a real value, not a placeholder for one.
 *
 * ⚠️ **The duplicate line is mocked — COS-329.** Nothing looks for duplicates before a commit; DATA
 * 03 (COS-308) is where the index learns to find them at all. The count is the mockup's own. */
function InsertPreview({
  draft,
  onScreenshotChange,
}: {
  draft: BookmarkDraft;
  onScreenshotChange: (file: File | null) => void;
}) {
  const none = CREATE_TEXT.preview.none;
  const host = hostOf(draft.url);

  const rows: { label: string; value: string }[] = [
    { label: CREATE_TEXT.preview.id, value: none },
    { label: CREATE_TEXT.preview.host, value: host === null ? none : (host ?? CREATE_TEXT.preview.hostPending) },
    {
      label: CREATE_TEXT.preview.tags,
      value: draft.categories.length > 0 ? draft.categories.map((tag) => tag.label).join(", ") : none,
    },
    { label: CREATE_TEXT.preview.prio, value: draft.priority || none },
    { label: CREATE_TEXT.preview.stars, value: String(draft.stars) },
    {
      label: CREATE_TEXT.preview.alarm,
      value:
        draft.reminder == null
          ? none
          : `${CREATE_TEXT.fields.alarmHint} ${CREATE_TEXT.fields.alarmDays(draft.reminder)}`,
    },
    { label: CREATE_TEXT.preview.shot, value: draft.screenshot ? CREATE_TEXT.preview.shotAttached : none },
  ];

  return (
    <>
      <ShotField
        file={draft.screenshot}
        onChange={onScreenshotChange}
      />

      <div className="grid gap-2">
        <Overline className="block">{CREATE_TEXT.sections.preview}</Overline>
        {/* A grid rather than the handoff's space-padded strings in a `white-space: pre` block. The
            whole interface is monospace, so padding by hand would look identical — and it would put
            the alignment in the copy, where a longer tag list silently breaks it. */}
        <dl className="grid grid-cols-[--spacing(14)_1fr] gap-x-2 gap-y-1 text-3xs leading-relaxed">
          {rows.map((row) => (
            <div
              key={row.label}
              className="col-span-2 grid grid-cols-subgrid"
            >
              <dt className="text-gr-fg-4">{row.label}</dt>
              <dd className="min-w-0 break-words text-gr-fg-3">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ⚠️ Mock — COS-329. */}
      <p className="border-t border-gr-border pt-3 text-3xs text-gr-fg-4">{CREATE_TEXT.mock.duplicates}</p>
    </>
  );
}

export { InsertPreview };
