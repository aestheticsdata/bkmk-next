"use client";

import { DeleteConfirm } from "@components/bookmarks/DeleteConfirm";
import { CommandBar } from "@components/ds/CommandBar";
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
 * **`delete` opens the confirmation modal** (COS-320), which is UI 11's second path. It shipped as
 * the index row's in-place pair — `delete? confirm cancel` in the bar — and that was always the
 * placeholder the ticket said it was. The reason it goes: an in-place pair works on a row because
 * you are looking at the row, and here the thing being deleted is the whole screen behind the bar.
 * The modal repeats the title and the url back, which is what tells you *which* record you are about
 * to lose, and says what leaves with it.
 *
 * ⚠️ **The handoff's fourth button, `alarm`, is not here** — see the note in `@text/record.ts`.
 *
 * `flex-wrap` below the fold is not decoration: three buttons and the breadcrumb are wider than a
 * phone, and a command bar that does not wrap pushes `open url` off the card. */
function RecordCommandBar({
  id,
  title,
  url,
  busy,
  onRemove,
}: {
  id: string;
  title: string;
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

        {/* Outline oxide, not filled: this button opens a question, it does not delete. The filled
            one is inside the modal, and there is exactly one of it. */}
        <Button
          variant="danger"
          size="chrome"
          onClick={() => setConfirming(true)}
        >
          {RECORD_TEXT.actions.remove}
        </Button>

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

      {/* Rendered from the bar because the bar is what asks, but it is portalled to `document.body`
          either way — nothing about its position depends on sitting inside a `.gr-cmd`. */}
      <DeleteConfirm
        id={id}
        title={title}
        url={url}
        open={confirming}
        onOpenChange={setConfirming}
        onConfirm={onRemove}
        busy={busy}
      />
    </CommandBar>
  );
}

export { RecordCommandBar };
