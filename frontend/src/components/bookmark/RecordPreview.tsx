"use client";

import { Overline } from "@components/ds/Overline";
import { ShotSlot } from "@components/ds/ShotSlot";
import { useScreenshot } from "@src/services/useScreenshot";
import { RECORD_TEXT } from "@text/record";

import type { BookmarkDetail } from "@src/schemas/bookmarks";

/* The right pane (COS-301): the screenshot, and nothing else.
 *
 * The handoff puts three blocks here — `preview`, `log`, `related · same tags` — and two of them are
 * columns the database does not have (§8.2 of the spec, DATA 04 / COS-309).
 *
 * ⚠️ **The ticket asks what happens to the pane once they are gone, and the answer is: nothing.**
 * Stretching the preview to fill 372×760 was tried and measured first, and it does not do what it
 * sounds like — a 1280×800 screenshot under `object-contain` still draws 331×207, so all the height
 * bought was a **bordered** empty area instead of a plain one, and an empty record turned into a
 * 700px dashed rectangle. `object-cover` fills honestly but crops a 16:10 page down to a vertical
 * strip, which is not a preview of anything.
 *
 * So the preview keeps the shape of the thing it shows, at the top of the pane, and the surface below
 * it stays surface. That is the quietest of the three, and the only one that does not either lie
 * about the image or shout about its absence. Collapsing the pane when a record has no screenshot
 * would be the fourth option, and it makes the screen change layout from one record to the next.
 *
 * The empty state takes the same 16:10, which is the ratio the capture actually produces — the
 * handoff's own slot is 332×178, a shape no screenshot in this application has. `ShotSlot` reads as
 * reserved space rather than as something that failed, the right register for a capture pipeline
 * that runs out of band: never captured, on its way, and captured but unreadable are three states of
 * one waiting room.
 *
 * A plain `<img>`, not `next/image`: the source is a `data:` URL the API builds by base64-encoding
 * the file, so there is no remote to optimise and no loader that would accept it. */
function RecordPreview({ record }: { record: BookmarkDetail }) {
  const { imageUrl, isLoading } = useScreenshot(record);

  /** Reached only when there is no image to show, so the last branch covers both a failed request
   *  and a request that answered with nothing usable. */
  const empty = !record.screenshot
    ? RECORD_TEXT.states.noShot
    : isLoading
      ? RECORD_TEXT.states.shotLoading
      : RECORD_TEXT.states.shotError;

  return (
    <>
      <Overline className="mb-2 block shrink-0">{RECORD_TEXT.sections.preview}</Overline>

      {imageUrl ? (
        // biome-ignore lint/performance/noImgElement: a `data:` URL has nothing to optimise and no `next/image` loader accepts one — see above.
        <img
          src={imageUrl}
          alt={RECORD_TEXT.aria.shot(record.title)}
          className="w-full shrink-0 rounded-lg border border-gr-border-2 bg-gr-sunk inset-shadow-gr-sunk"
        />
      ) : (
        <ShotSlot className="aspect-16/10 w-full shrink-0 px-4 text-center">{empty}</ShotSlot>
      )}
    </>
  );
}

export { RecordPreview };
