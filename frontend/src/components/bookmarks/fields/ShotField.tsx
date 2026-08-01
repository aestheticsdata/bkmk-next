"use client";

import { MiniButton } from "@components/ds/MiniButton";
import { Overline } from "@components/ds/Overline";
import { ShotSlot } from "@components/ds/ShotSlot";
import { cn } from "@lib/utils";
import { CREATE_TEXT } from "@text/create";
import { useEffect, useId, useState } from "react";

/** `multer({ limits: { fileSize: 10_000_000 } })` in `routes/api/bookmarks.js`. Checked here so an
 *  oversized file is refused before it is uploaded rather than after — multer aborts the request and
 *  the form would only learn about it as a failed commit. */
const MAX_SHOT_BYTES = 10_000_000;

/** What `jimpHelper` can actually open, and what the legacy file input accepted. */
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

/* `shot` — the screenshot, and the right pane's first block (COS-302).
 *
 * ⚠️ **`auto capture` and `queued · 1280×800` are mocked — COS-393.** The handoff describes a capture
 * taken from the url by the server; nothing in bkmk takes one. What the application has, and what
 * this ships, is the manual upload the legacy form had: `bookmark.screenshot` holds a filename, and
 * the only thing that ever writes one is the file on this line. The caption and the slot's reading
 * are the mockup's words kept over a real control, which is the owner's call for everything the
 * design promises and the code does not yet have.
 *
 * The raw `<input type="file">` does not survive the repaint: it draws its own button in the
 * browser's chrome, at the browser's size, in the browser's colours — the one control on the screen
 * GRAPHITE cannot reach. So it is `sr-only` and the `<label>` is the button, which keeps the click
 * target, the keyboard path and the accessible name that a `<div onClick>` would each have cost.
 *
 * **The file is checked before it is held, not before it is sent.** A file too large or of the wrong
 * type never becomes the draft's screenshot, so the preview cannot show something the commit will
 * refuse. `accept` on the input is a filter in the picker, not a guarantee — a drag or a renamed
 * file walks straight past it.
 *
 * **`captured` is what the edit surface adds** (COS-319), and it is a third state rather than a
 * second component: a record can already carry a screenshot on the server, which is neither "no
 * file" nor "this file". It changes what the field says and what `remove` removes — the file on the
 * server rather than the one in the draft. The insert screen never passes it.
 *
 * ⚠️ **`compact` is the modal's shape, and the handoff asks for it.** There the capture is half of a
 * two-column row beside `alarm` — `captured` | `none` and `re-capture`, no slot — where on the
 * insert screen it is the first block of a right-hand pane and gets the full 146px. Rendered whole
 * inside a 680px dialog it added a third of the panel's height for a reserved space with nothing in
 * it; measured at 1440×900 the modal filled the viewport and the footer needed scrolling to. The
 * preview image goes with the slot: a file just picked is named by the button beside it. */
function ShotField({
  file,
  captured = null,
  compact = false,
  className,
  onChange,
  onDropCaptured,
}: {
  file: File | null;
  /** The filename the record already holds, or `null`. Edit only. */
  captured?: string | null;
  /** Drop the 146px slot and the preview, leaving the header and the buttons. Edit only. */
  compact?: boolean;
  className?: string;
  onChange: (file: File | null) => void;
  /** Forget the server's capture. Required whenever `captured` can be set. */
  onDropCaptured?: () => void;
}) {
  const inputId = useId();
  const [rejected, setRejected] = useState<string>();
  const [preview, setPreview] = useState<string>();

  /* An object URL rather than a `FileReader` and a base64 string: it is a pointer to a file the
   * browser already holds, so it costs nothing to make and nothing to keep. It does have to be
   * released — hence the cleanup, which also fires on every change, so replacing a file does not
   * leave the previous one alive for the life of the page. */
  useEffect(() => {
    if (!file) {
      setPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const accept = (picked: File | undefined) => {
    if (!picked) return;
    if (!ACCEPTED_TYPES.includes(picked.type)) {
      setRejected(CREATE_TEXT.shot.wrongType);
      return;
    }
    if (picked.size > MAX_SHOT_BYTES) {
      setRejected(CREATE_TEXT.shot.tooLarge);
      return;
    }
    setRejected(undefined);
    onChange(picked);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex h-4 items-center gap-1.5 leading-4">
        <Overline>{CREATE_TEXT.sections.shot}</Overline>
        {/* ⚠️ Mock — COS-393. Dimmed rather than in the label's own ink: it names a pipeline that
            does not run, and it should not read as a setting that is on. */}
        <Overline className="text-gr-fg-4">· {CREATE_TEXT.shot.autoCapture}</Overline>
        {/* The state, in the header row where `Field` puts its own messages. Teal when the record
            carries a capture, dim when it does not — the handoff's `captured` / `none` pair, as a
            read-out rather than as two segments, because it is one and pressing it does nothing. */}
        {compact && (
          <Overline className={captured || file ? "text-gr-accent" : "text-gr-fg-4"}>
            · {captured || file ? CREATE_TEXT.shot.captured : CREATE_TEXT.fields.unset}
          </Overline>
        )}
        {rejected && <Overline className="ml-auto text-gr-accent-2">{rejected}</Overline>}
      </div>

      {compact ? null : preview ? (
        // biome-ignore lint/performance/noImgElement: an object URL points at a local file — there is nothing for `next/image` to optimise and no loader that accepts one.
        <img
          src={preview}
          alt={CREATE_TEXT.aria.shot}
          className="h-36.5 w-full rounded-lg border border-gr-border-2 bg-gr-sunk object-cover object-top inset-shadow-gr-sunk"
        />
      ) : (
        /* 146px, the handoff's slot on this screen. Fixed rather than an aspect ratio — unlike the
           record's preview, this one is a reserved space with nothing in it yet, and the pane's
           layout should not move when a file lands in it. */
        <ShotSlot className="h-36.5 w-full px-4 text-center">
          {/* A record that has one says so; a record that has none carries the mockup's reading.
              ⚠️ Mock — COS-393. Neither the queue nor the dimensions exist. */}
          {captured ? CREATE_TEXT.shot.captured : CREATE_TEXT.mock.shotQueued}
        </ShotSlot>
      )}

      <div className="flex items-center gap-2">
        <input
          type="file"
          id={inputId}
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => {
            accept(event.target.files?.[0]);
            /* The value is cleared so that picking the *same* file again still fires `change` — the
               gesture after a rejection, and the one that would otherwise do nothing. */
            event.target.value = "";
          }}
        />
        <MiniButton asChild>
          {/* `asChild`: the label has to be the control, or the button inside it swallows the click
              that opens the picker. */}
          <label
            htmlFor={inputId}
            className="cursor-pointer"
          >
            {file ? CREATE_TEXT.shot.replace : captured ? CREATE_TEXT.shot.recapture : CREATE_TEXT.shot.choose}
          </label>
        </MiniButton>

        {/* One `remove`, two things to remove: the file being attached, or the one the record already
            has. Never both at once — a new file replaces the server's capture on save, so the pair
            cannot be in play at the same time. */}
        {file ? (
          <MiniButton
            danger
            onClick={() => {
              setRejected(undefined);
              onChange(null);
            }}
          >
            {CREATE_TEXT.shot.remove}
          </MiniButton>
        ) : captured ? (
          <MiniButton
            danger
            onClick={onDropCaptured}
          >
            {CREATE_TEXT.shot.remove}
          </MiniButton>
        ) : (
          <Overline className="text-gr-fg-4">{CREATE_TEXT.shot.accept}</Overline>
        )}
      </div>
    </div>
  );
}

export { ShotField };
