"use client";

import { RecordCommandBar } from "@components/bookmark/RecordCommandBar";
import { RecordFields } from "@components/bookmark/RecordFields";
import { RecordNote } from "@components/bookmark/RecordNote";
import { RecordPreview } from "@components/bookmark/RecordPreview";
import { Card } from "@components/ds/Card";
import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import { useBookmarkRecord } from "@src/services/useBookmarkRecord";
import { RECORD_TEXT } from "@text/record";
import { useRouter } from "next/navigation";

/* `Detail_Graphite` — the record (COS-301), and the screen the index opens onto.
 *
 * **It is read-only**, which is §9 of the handoff: editing is a modal laid over whichever screen you
 * are on (COS-319), not a second page carrying the same fields with inputs in them. So what is here
 * is one card, split: the record on the left, its screenshot on the right.
 *
 * ⚠️ **The card is as tall as the record, not as tall as the desk** — `max-h-full` rather than the
 * index's `flex-1`, and that is the answer to the layout question the ticket asks. With `log` and
 * `related` gone, a full-height card leaves the right pane holding a 207px preview above 500px of
 * nothing; measured at 1440×900, hugging the content takes that from 511px of empty pane to 262. A
 * long record still fills the desk, and then the left column scrolls under a preview that stays put —
 * which is the handoff's arrangement, and the reason the pane is a pane rather than a block further
 * down the page.
 *
 * Below the fold the two sides stack, the pane's left rule becomes a top rule, and **the scrolling
 * moves out to the desk**: no cap on the card, no scroller on either side. Two independent scrollers
 * inside one card is a desktop arrangement — on a phone the card is the page, and the page scrolls.
 *
 * ⚠️ `@max-3xl:shrink-0` is what makes that safe, and it was measured the hard way: the desk is a
 * flex column, so a card taller than it shrinks to fit by default, and `Card` clips
 * (`overflow-hidden`). Without it the end of a long note was cut off at 420px with nothing anywhere
 * to scroll it back.
 *
 * Deleting navigates back to the index rather than leaving an empty card behind — the record this
 * screen is about no longer exists, and `router.replace` is what keeps `back` from returning to it. */
function BookmarkRecord({ id }: { id: string }) {
  const router = useRouter();
  const { record, missing, isLoading, isError, remove } = useBookmarkRecord(id);

  if (isLoading || isError || missing || !record) {
    return (
      <Card className="grid min-h-0 flex-1 place-items-center">
        <Overline className={isError ? "text-gr-accent-2" : undefined}>
          {isError ? RECORD_TEXT.states.error : missing ? RECORD_TEXT.states.missing : RECORD_TEXT.states.loading}
        </Overline>
      </Card>
    );
  }

  return (
    <Card className="flex max-h-full min-h-0 flex-col @max-3xl:max-h-none @max-3xl:shrink-0">
      <RecordCommandBar
        id={id}
        title={record.title}
        url={record.original_url ?? undefined}
        /* `alarm_frequency` and not an alarm id: it is the field `getBookmarkController` returns, and
           the one `RecordFields` already reads to choose between `armed · every Nd` and `none`. Two
           places on one screen deciding "is this armed" differently is the thing to avoid. */
        hasAlarm={Boolean(record.alarm_frequency)}
        busy={remove.isPending}
        onRemove={() => remove.mutate(undefined, { onSuccess: () => router.replace(ROUTES.bookmarks.path) })}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_--spacing(93)] @max-3xl:grid-cols-1">
        <div className="gr-scroll min-h-0 overflow-y-auto px-6 py-5.5 @max-3xl:overflow-visible @max-3xl:px-3.5 @max-3xl:py-4">
          <Overline className="block">{RECORD_TEXT.sections.title}</Overline>
          {/* 21px in the handoff, snapped to 20 (`text-xl`) by the DS 01 table. `max-w-155` is the
              620px the mockup caps it at — a title is read in lines, not across a desk. */}
          <h1 className="mt-1 mb-5 max-w-155 text-pretty text-xl font-semibold tracking-snug text-gr-fg-2">
            {record.title}
          </h1>

          <Overline className="mb-1.5 block">{RECORD_TEXT.sections.fields}</Overline>
          <RecordFields record={record} />

          <RecordNote note={record.notes} />
        </div>

        <div className="gr-scroll flex min-h-0 flex-col overflow-y-auto border-l border-gr-border bg-white/10 p-5 @max-3xl:overflow-visible @max-3xl:border-t @max-3xl:border-l-0 @max-3xl:p-3.5">
          <RecordPreview record={record} />
        </div>
      </div>
    </Card>
  );
}

export { BookmarkRecord };
