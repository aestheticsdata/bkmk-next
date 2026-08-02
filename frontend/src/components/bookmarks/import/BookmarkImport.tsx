"use client";

import { ImportCommandBar } from "@components/bookmarks/import/ImportCommandBar";
import { ImportDropZone } from "@components/bookmarks/import/ImportDropZone";
import { ImportFormats } from "@components/bookmarks/import/ImportFormats";
import { ImportOptions } from "@components/bookmarks/import/ImportOptions";
import { ImportStaged } from "@components/bookmarks/import/ImportStaged";
import { Card } from "@components/ds/Card";
import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import { useImportCommit, useImportParse } from "@src/services/useBookmarkImport";
import { IMPORT_TEXT } from "@text/import";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { ImportOptions as Options } from "@src/schemas/import";

/** `skip duplicates` on, because importing the same export twice is the case the state column was
 *  drawn for; `tag as imported` off, as the handoff draws it, since it writes a category nobody
 *  asked for. */
const DEFAULT_OPTIONS: Options = { skipDuplicates: true, tagAsImported: false };

/* `Upload_Graphite` — the import screen (COS-303, staged for real by COS-307).
 *
 * **What the screen was**: a file input, a `send` button, a paragraph of French, and a `<pre>`
 * holding a raw `sed -n 'l'` dump of a Session Buddy export. All of the information survives; the
 * documentation moved into the right pane, where the handoff puts it.
 *
 * ⚠️ **The staging is the API's now, and it is the whole point of DATA 02.** UI 07 parsed the file in
 * the browser because no endpoint parsed without writing, which meant two parsers that had to be
 * kept in step by hand and a `state` column that could only say `NEW`. Dropping a file now posts it
 * to `POST /bookmarks/import/parse`, which answers with the entries, what each one is against the
 * index, and the four counts; `send` posts the same file to `POST /bookmarks/import` with the two
 * options. The browser-side parser is gone.
 *
 * ⚠️ **`send` lights up when there is a parse, not when there is a file.** What is sent is what the
 * table showed, so the button follows the table: while the parse is in flight there is nothing
 * staged to commit, and if the parse failed, committing would be sending a file the server just
 * failed to read.
 *
 * The card fills the desk, like the insert screen's — the right pane has the same content at every
 * moment, so there is no empty height to avoid, and the left column is meant to scroll under it. */
function BookmarkImport() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>();
  const [options, setOptions] = useState<Options>(DEFAULT_OPTIONS);
  const parse = useImportParse();
  const commit = useImportCommit();

  /* Staging a file is one call, made from the gesture that picked it rather than from an effect
   * watching `file`: an effect would have to carry the mutation in its dependencies and re-run when
   * react-query changes its state, which is a request per render. `reset()` first, so the previous
   * file's table is not on screen while the new one uploads. */
  const stage = (picked: File) => {
    setError(undefined);
    setFile(picked);
    parse.reset();
    parse.mutate(picked);
  };

  const leave = () => router.push(ROUTES.bookmarks.path);

  const send = () => {
    if (!file || !parse.data || commit.isPending) return;
    commit.mutate({ file, options }, { onSuccess: leave });
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
      send();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [send]);

  return (
    <Card className="flex min-h-0 flex-1 flex-col @max-3xl:flex-none @max-3xl:shrink-0">
      <ImportCommandBar
        busy={commit.isPending}
        ready={Boolean(parse.data)}
        onCancel={leave}
        onSend={send}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_--spacing(95)] @max-3xl:grid-cols-1">
        <div className="gr-scroll grid min-h-0 content-start gap-4.5 overflow-y-auto px-6 py-5.5 @max-3xl:overflow-visible @max-3xl:px-3.5 @max-3xl:py-4">
          <ImportDropZone
            file={file}
            error={error}
            onFile={stage}
            onError={setError}
          />

          {file && parse.isPending && <Overline>{IMPORT_TEXT.states.reading}</Overline>}
          {file && parse.isError && <Overline className="text-gr-accent-2">{IMPORT_TEXT.errors.parse}</Overline>}
          {file && parse.data && (
            <ImportStaged
              filename={file.name}
              staged={parse.data}
            />
          )}

          <ImportOptions
            options={options}
            onChange={setOptions}
            disabled={commit.isPending}
          />

          {commit.isError && <Overline className="text-gr-accent-2">{IMPORT_TEXT.errors.submit}</Overline>}
        </div>

        {/* `16/14` below the fold, the padding the column beside it takes — see the note in
            `BookmarkRecord` (COS-311). */}
        <div className="gr-scroll grid min-h-0 content-start gap-4 overflow-y-auto border-l border-gr-border bg-white/10 p-5 @max-3xl:overflow-visible @max-3xl:border-t @max-3xl:border-l-0 @max-3xl:px-3.5 @max-3xl:py-4">
          <ImportFormats />
        </div>
      </div>
    </Card>
  );
}

export { BookmarkImport };
