"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { useMutation } from "@tanstack/react-query";

import type { ExportFormat } from "@src/schemas/bookmarks";

/** Falls back to a name only if the server did not send `Content-Disposition` — which it always
 *  does. The date is here so that the fallback is still two different files on two days. */
const fallbackName = (format: ExportFormat) => `bkmk-${new Date().toISOString().slice(0, 10)}.${format}`;

/** The filename the server chose, out of `attachment; filename="bkmk-2026-08-01.json"`. Reading it
 *  rather than rebuilding it keeps one side in charge of what the file is called. */
const nameFrom = (disposition: unknown, format: ExportFormat): string => {
  const match = typeof disposition === "string" ? /filename="([^"]+)"/.exec(disposition) : null;
  return match?.[1] ?? fallbackName(format);
};

/* Downloading the whole index (COS-333).
 *
 * ⚠️ **It goes through `privateRequest`, not through a bare `<a download>`.** The anchor works — a
 * GET, a `SameSite=lax` cookie, a top-level navigation — and that is the problem: it bypasses the
 * 401 → `/login` redirect in `useRequestHelper`, so an expired session downloads a login page named
 * `bkmk-2026-08-01.csv`. Fetching the blob puts the request back on the one door the application
 * has, and the file is handed to the browser afterwards.
 *
 * **The object URL is revoked**, and the anchor is never added to the document: a click on a
 * detached `<a>` starts the download just as well, and there is nothing to clean out of the DOM if
 * the download dialog is cancelled.
 *
 * **No cache entry.** It is a mutation rather than a query, which is what it behaves like: nothing on
 * screen shows the file, asking twice must ask twice, and react-query holding a few hundred kilobytes
 * of blob for a download that already happened would be storage for its own sake.
 */
function useBookmarkExport() {
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async (format: ExportFormat) => {
      const response = await privateRequest(`/bookmarks/export?format=${format}`, { responseType: "blob" });

      const url = URL.createObjectURL(response.data as Blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = nameFrom(response.headers["content-disposition"], format);
      anchor.click();
      URL.revokeObjectURL(url);

      /** The record count travels on a header: two of the three formats have nowhere to put it, and
       *  the caller should not have to read the file it just handed to the browser. */
      const count = Number(response.headers["x-record-count"]);
      return { format, count: Number.isFinite(count) ? count : null };
    },
  });
}

export { useBookmarkExport };
