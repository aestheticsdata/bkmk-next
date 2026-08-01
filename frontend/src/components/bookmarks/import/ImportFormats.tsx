"use client";

import { Overline } from "@components/ds/Overline";
import { useLastImport } from "@src/services/useBookmarkImport";
import { IMPORT_TEXT } from "@text/import";

/* The right pane (COS-303): what the screen accepts, and what those two files look like.
 *
 * **This is the one block of the screen that is entirely real, and it is the legacy page's own
 * content.** That page opened with a paragraph of French, a bare link to the Chrome Web Store, and a
 * `<pre>` holding the raw output of `sed -n 'l'` over a Session Buddy export — escape codes, byte
 * sequences for the BOM and all. Same information, in English, as two short shape blocks; the `$`
 * that made the dump unreadable is explained in one line under the first one, because it is also
 * what makes the format legible.
 *
 * The link survives because it earns its keep: the `.txt` shape only exists if you have the
 * extension, and this is where you find out which one it is.
 *
 * ⚠️ **`last import` is real since COS-307**, read from `import_run` — a row written by the commit,
 * inside the transaction that inserts the records, so the line cannot describe an import that rolled
 * back. It was the handoff's own sample date until then. An account that has never imported gets a
 * sentence saying so rather than a zeroed reading. It is the pane's footer rather than a block, and
 * it is in the quietest ink on the screen.
 *
 * The hook lives here rather than in `BookmarkImport` because this is the only thing that reads it,
 * and the commit invalidates the whole `bookmarks` root — so the line refreshes itself. */
function ImportFormats() {
  const { lastImport } = useLastImport();

  return (
    <>
      <div className="grid gap-1.5">
        <Overline className="block">{IMPORT_TEXT.sections.formats}</Overline>
        <p className="text-2xs leading-relaxed text-gr-fg-3">
          {IMPORT_TEXT.formats.lead}{" "}
          <a
            href={IMPORT_TEXT.formats.extensionHref}
            target="_blank"
            rel="noopener"
            className="rounded-sm font-semibold text-gr-accent underline underline-offset-2 outline-none hover:text-gr-fg-2 hover:no-underline focus-visible:ring-3 focus-visible:ring-gr-ring"
          >
            {IMPORT_TEXT.formats.extension}
          </a>{" "}
          {IMPORT_TEXT.formats.tail} <span className="text-gr-fg-2">{IMPORT_TEXT.formats.pair}</span>{" "}
          {IMPORT_TEXT.formats.tailEnd}
        </p>
      </div>

      <div className="grid gap-1.5">
        <Overline className="block">{IMPORT_TEXT.sections.txtShape}</Overline>
        <Shape>{IMPORT_TEXT.formats.txt}</Shape>
        <Overline className="text-gr-fg-4">{IMPORT_TEXT.formats.txtNote}</Overline>
      </div>

      <div className="grid gap-1.5">
        <Overline className="block">{IMPORT_TEXT.sections.csvShape}</Overline>
        <Shape>{IMPORT_TEXT.formats.csv}</Shape>
      </div>

      <p className="border-t border-gr-border pt-3 text-3xs leading-relaxed text-gr-fg-4">
        {lastImport
          ? IMPORT_TEXT.lastImport.line(lastImport.ranAt, lastImport.entries, lastImport.skipped)
          : IMPORT_TEXT.lastImport.none}
      </p>
    </>
  );
}

/* The handoff's `gr-code`. Not a `ds/` primitive: two blocks on one screen is not a vocabulary, and
 * the sunken surface it is made of already is one (`ui/input`, `ds/ShotSlot`). If a third appears,
 * it moves.
 *
 * `overflow-x-auto` because these lines are urls and they are not going to wrap usefully — the pane
 * is 380px and the block scrolls inside it rather than pushing the card sideways. */
function Shape({ children }: { children: string }) {
  return (
    <pre className="gr-scroll overflow-x-auto rounded-lg border border-gr-border bg-gr-sunk px-3 py-2 text-3xs leading-relaxed text-gr-fg-3 inset-shadow-gr-sunk">
      {children}
    </pre>
  );
}

export { ImportFormats };
