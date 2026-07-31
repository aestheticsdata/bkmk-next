"use client";

import { ImportCommandBar } from "@components/bookmarks/import/ImportCommandBar";
import { ImportDropZone } from "@components/bookmarks/import/ImportDropZone";
import { ImportFormats } from "@components/bookmarks/import/ImportFormats";
import { ImportOptions } from "@components/bookmarks/import/ImportOptions";
import { ImportStaged } from "@components/bookmarks/import/ImportStaged";
import { parseImportFile } from "@components/bookmarks/import/parseImport";
import { Card } from "@components/ds/Card";
import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import { useBookmarkImport } from "@src/services/useBookmarkImport";
import { IMPORT_TEXT } from "@text/import";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { ParseResult } from "@components/bookmarks/import/parseImport";

/* `Upload_Graphite` — the import screen (COS-303).
 *
 * **What the screen was**: a file input, a `send` button, a paragraph of French, and a `<pre>`
 * holding a raw `sed -n 'l'` dump of a Session Buddy export. All of the information survives; the
 * documentation moved into the right pane, where the handoff puts it.
 *
 * **What is new is the staging, and it is real.** The file is read and parsed in the browser before
 * anything is sent, so you can see what is in it — `title`, `host`, how many entries, how many lines
 * the parser could not read. `parseImport.ts` mirrors the backend's parser deliberately, and its
 * header says why it exists twice and what removes it.
 *
 * ⚠️ **Three things the handoff draws are mocked — COS-307**, marked where they are drawn: the
 * `NEW` / `DUP` state with the `new` / `duplicate` halves of the summary, the three `on import`
 * options, and `last import`. That ticket is DATA 02, which is also the parse endpoint, so all four
 * arrive together.
 *
 * ⚠️ **`send` still posts the whole file.** The staging is a preview of the import, not a
 * transaction that precedes it: there is one endpoint and it imports every line. Anything else would
 * mean a commit endpoint, which is COS-307's.
 *
 * The card fills the desk, like the insert screen's — the right pane has the same content at every
 * moment, so there is no empty height to avoid, and the left column is meant to scroll under it. */
function BookmarkImport() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParseResult>();
  const [error, setError] = useState<string>();
  const send = useBookmarkImport();

  /* Reading the file is asynchronous and parsing it is not free — a Session Buddy export runs to
   * thousands of lines — so it happens once per file, in an effect, rather than during render.
   *
   * `cancelled` is what keeps a slow read of a large file from landing after a second, smaller file
   * has already been staged: without it the table would end up showing the wrong file's entries. */
  useEffect(() => {
    if (!file) {
      setParsed(undefined);
      return;
    }

    let cancelled = false;
    setParsed(undefined);

    file
      .text()
      .then((text) => {
        if (cancelled) return;
        setParsed(parseImportFile(file.name, text));
      })
      .catch(() => {
        if (cancelled) return;
        setError(IMPORT_TEXT.drop.unreadable);
        setFile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  const leave = () => router.push(ROUTES.bookmarks.path);

  const commit = () => {
    if (!file || send.isPending) return;
    send.mutate(file, { onSuccess: leave });
  };

  /* `⌘↵ send`, which the status bar has printed since DS 03 — `drop file` beside it is a gesture,
   * not a key, so there is nothing to bind for it.
   *
   * No `esc` here, unlike the insert screen: the handoff's hints for this screen are `drop file` and
   * `⌘↵ send`, and it does not print one. A key that leaves the screen without being announced
   * anywhere is worse than no key. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      commit();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col @max-3xl:flex-none @max-3xl:shrink-0">
      <ImportCommandBar
        busy={send.isPending}
        ready={Boolean(file)}
        onCancel={leave}
        onSend={commit}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_--spacing(95)] @max-3xl:grid-cols-1">
        <div className="gr-scroll grid min-h-0 content-start gap-4.5 overflow-y-auto px-6 py-5.5 @max-3xl:overflow-visible @max-3xl:px-3.5 @max-3xl:py-4">
          <ImportDropZone
            file={file}
            error={error}
            onFile={(picked) => {
              setError(undefined);
              setFile(picked);
            }}
            onError={setError}
          />

          {file &&
            (parsed ? (
              <ImportStaged
                filename={file.name}
                parsed={parsed}
              />
            ) : (
              <Overline>{IMPORT_TEXT.states.reading}</Overline>
            ))}

          <ImportOptions />

          {send.isError && <Overline className="text-gr-accent-2">{IMPORT_TEXT.errors.submit}</Overline>}
        </div>

        <div className="gr-scroll grid min-h-0 content-start gap-4 overflow-y-auto border-l border-gr-border bg-white/10 p-5 @max-3xl:overflow-visible @max-3xl:border-t @max-3xl:border-l-0 @max-3xl:p-3.5">
          <ImportFormats />
        </div>
      </div>
    </Card>
  );
}

export { BookmarkImport };
