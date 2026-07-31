"use client";

import { CommandBar } from "@components/ds/CommandBar";
import { MiniButton } from "@components/ds/MiniButton";
import { Overline } from "@components/ds/Overline";
import { editHref, ROUTES } from "@components/shared/config/constants";
import { Button } from "@components/ui/button";
import { RECORD_TEXT } from "@text/record";
import Link from "next/link";
import { useState } from "react";

/* The record's command bar (COS-301): where you are, and the three things you can do from here.
 *
 * **`edit` opens the modal over this page** (COS-319), and it is a plain `<Link>` that does it: the
 * edit route is intercepted, so a client navigation lays the dialog on top of the record instead of
 * replacing it. Closing goes back, and the record is still here, still scrolled where it was.
 *
 * **`delete` confirms in place**, the pattern the index row already uses: the button becomes
 * `delete? confirm cancel`, and nothing is destroyed on a single click. UI 11 (COS-320) replaces it
 * with the handoff's confirmation modal, which is where the record's title and url get repeated back
 * before it goes; the in-place pair is deliberately the smaller thing to throw away.
 *
 * ⚠️ **The handoff's fourth button, `alarm`, is not here** — see the note in `@text/record.ts`.
 *
 * `flex-wrap` below the fold is not decoration: three buttons and the breadcrumb are wider than a
 * phone, and a command bar that does not wrap pushes `open url` off the card. */
function RecordCommandBar({
  id,
  url,
  busy,
  onRemove,
}: {
  id: string;
  url?: string;
  busy: boolean;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <CommandBar className="@max-3xl:flex-wrap @max-3xl:py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Overline
          asChild
          className="text-gr-accent transition-colors duration-120 outline-none hover:text-gr-fg-2 focus-visible:ring-3 focus-visible:ring-gr-ring"
        >
          <Link href={ROUTES.bookmarks.path}>{RECORD_TEXT.index}</Link>
        </Overline>
        <Overline className="text-gr-fg-4">{RECORD_TEXT.separator}</Overline>
        <Overline className="truncate text-gr-fg-2">{RECORD_TEXT.record(id)}</Overline>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button
          asChild
          variant="chrome"
          size="chrome"
        >
          <Link href={editHref(id)}>{RECORD_TEXT.actions.edit}</Link>
        </Button>

        {confirming ? (
          <>
            <Overline className="text-gr-accent-2">{RECORD_TEXT.actions.askRemove}</Overline>
            <MiniButton
              danger
              disabled={busy}
              onClick={onRemove}
            >
              {RECORD_TEXT.actions.confirm}
            </MiniButton>
            <MiniButton onClick={() => setConfirming(false)}>{RECORD_TEXT.actions.cancel}</MiniButton>
          </>
        ) : (
          <Button
            variant="danger"
            size="chrome"
            onClick={() => setConfirming(true)}
          >
            {RECORD_TEXT.actions.remove}
          </Button>
        )}

        {/* Disabled rather than absent on a record with no url, as in the index row: the bar keeps
            the same shape whichever record is open. */}
        {url ? (
          <Button
            asChild
            variant="primary"
            size="chrome"
          >
            <a
              href={url}
              target="_blank"
              rel="noopener"
            >
              {RECORD_TEXT.actions.open}
            </a>
          </Button>
        ) : (
          <Button
            variant="primary"
            size="chrome"
            disabled
            title={RECORD_TEXT.actions.noUrl}
          >
            {RECORD_TEXT.actions.open}
          </Button>
        )}
      </div>
    </CommandBar>
  );
}

export { RecordCommandBar };
