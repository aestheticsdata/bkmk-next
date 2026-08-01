"use client";

import { DropZone } from "@components/ds/DropZone";
import { Overline } from "@components/ds/Overline";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { IMPORT_TEXT } from "@text/import";
import { useId, useState } from "react";

/** `multer({ limits: { fileSize: 10_000_000 } })`, on both import routes. Checked here so an
 *  oversized file is refused before it is sent rather than after multer aborts the request. */
const MAX_IMPORT_BYTES = 10_000_000;

/** What the two parsers can read. Matched on the extension rather than on `file.type`, which is what
 *  the operating system guesses: a `.csv` arrives as `text/csv`, `application/vnd.ms-excel` or
 *  nothing at all depending on whether Excel is installed. */
const ACCEPTED_EXTENSIONS = [".txt", ".csv"];

/* The file block (COS-303) — the handoff's `gr-drop`, and the only control on the left column until
 * something is staged.
 *
 * **It is a real drop target**, which `ds/DropZone` deliberately is not: that primitive is the shape,
 * and its comment says the drag state belongs to the screen that wires the events. This is that
 * screen. The border and the fill answer `dragover`, and `dragleave` has a counter behind it —
 * without one, moving the pointer over a child element fires `dragleave` on the parent and the
 * highlight flickers off while the file is still over the zone.
 *
 * The `<input type="file">` is `sr-only` behind a `<label>` for the reason the insert screen's is:
 * it draws its own button, at the browser's size, in the browser's colours.
 *
 * ⚠️ **`max 10 mb` and not the handoff's 5**: the API's ceiling is ten, and a screen refusing a file
 * the server would take is a worse lie than a generous number. See `IMPORT_TEXT.drop.limits`. */
function ImportDropZone({
  file,
  error,
  onFile,
  onError,
}: {
  file: File | null;
  error?: string;
  onFile: (file: File) => void;
  /** Rejections are the screen's to show, next to the caption — it owns the whole left column. */
  onError: (message: string) => void;
}) {
  const inputId = useId();
  const [dragDepth, setDragDepth] = useState(0);

  const accept = (picked: File | undefined) => {
    if (!picked) return;
    const name = picked.name.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension))) {
      onError(IMPORT_TEXT.drop.wrongType);
      return;
    }
    if (picked.size > MAX_IMPORT_BYTES) {
      onError(IMPORT_TEXT.drop.tooLarge);
      return;
    }
    onFile(picked);
  };

  return (
    <div className="grid gap-2">
      <div className="flex h-4 items-center gap-2 leading-4">
        <Overline>{IMPORT_TEXT.sections.file}</Overline>
        {error && <Overline className="ml-auto text-gr-accent-2">{error}</Overline>}
      </div>

      <DropZone
        onDragEnter={(event) => {
          event.preventDefault();
          setDragDepth((depth) => depth + 1);
        }}
        onDragLeave={() => setDragDepth((depth) => Math.max(0, depth - 1))}
        // Without this the browser navigates to the file instead of handing it over.
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setDragDepth(0);
          accept(event.dataTransfer.files?.[0]);
        }}
        className={cn("transition-colors duration-120", dragDepth > 0 && "border-gr-accent bg-gr-accent/8")}
      >
        <p className="text-sm tracking-wide text-gr-fg-2">{file ? file.name : IMPORT_TEXT.drop.prompt}</p>
        <Overline>{IMPORT_TEXT.drop.or}</Overline>

        <Button
          asChild
          variant="chrome"
          size="chrome"
        >
          {/* `asChild`: the label has to *be* the control, or a button inside it swallows the click
              that opens the picker. */}
          <label
            htmlFor={inputId}
            className="cursor-pointer"
          >
            {file ? IMPORT_TEXT.drop.replace : IMPORT_TEXT.drop.choose}
          </label>
        </Button>

        <Overline className="text-gr-fg-4">{IMPORT_TEXT.drop.limits}</Overline>

        <input
          type="file"
          id={inputId}
          accept={ACCEPTED_EXTENSIONS.join(",")}
          aria-label={IMPORT_TEXT.aria.file}
          className="sr-only"
          onChange={(event) => {
            accept(event.target.files?.[0]);
            /* Cleared so that picking the *same* file again still fires `change` — the gesture after
               a rejection, and the one that would otherwise do nothing. */
            event.target.value = "";
          }}
        />
      </DropZone>
    </div>
  );
}

export { ImportDropZone, MAX_IMPORT_BYTES };
