"use client";

import { useAuth } from "@auth/context/AuthContext";
import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { ImportCommitResponseSchema, ImportParseResponseSchema, LastImportResponseSchema } from "@src/schemas/import";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ImportOptions } from "@src/schemas/import";

/** The multipart field name is the backend's: `upload.single("bookmark_file")`, on both routes. */
const FILE_FIELD = "bookmark_file";

const fileBody = (file: File): FormData => {
  const body = new FormData();
  body.append(FILE_FIELD, file);
  return body;
};

/* The import, in three calls (COS-307).
 *
 * UI 07 had one: `POST /bookmarks/upload`, which took the file and imported every line of it, so the
 * staging on screen was a preview drawn by a parser the browser carried for the occasion. The
 * staging is now the API's — see `schemas/import.ts` for the three routes and what each answers.
 *
 * ⚠️ **The file is sent twice, once to each POST, and that is the design.** Nothing is remembered
 * between the two calls: there is no staging table, no draft in the session, and no entry list
 * travelling back up. The commit re-parses the same file, so what it writes is what the preview
 * showed, and neither side has to trust the other's copy of it. `commitImportController` carries the
 * long version of the reasoning.
 */
function useImportParse() {
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async (file: File) => {
      const response = await privateRequest("/bookmarks/import/parse", { method: "POST", data: fileBody(file) });
      // The boundary: a staged file leaves this function, not an axios response.
      return ImportParseResponseSchema.parse(response.data);
    },
  });
}

/* The commit.
 *
 * The two options travel as `"1"` / `"0"` because a multipart body carries strings and the API reads
 * them as such — `"false"` is a non-empty string, which is the bug `queryFlagSchema` exists to keep
 * out. There is no third option to leave out any more: `captureShots` was never sent, and since
 * COS-394 it is not drawn either — screenshots stay manual.
 *
 * `bookmarks.all` is the whole root, so invalidating it covers the index, the chrome's counter *and*
 * `last-import`, which hangs under it precisely so that one call refreshes the line saying an import
 * just happened. The categories go with it because `tag as imported` can create one. */
function useImportCommit() {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async ({ file, options }: { file: File; options: ImportOptions }) => {
      const body = fileBody(file);
      body.append("skipDuplicates", options.skipDuplicates ? "1" : "0");
      body.append("tagAsImported", options.tagAsImported ? "1" : "0");

      const response = await privateRequest("/bookmarks/import", { method: "POST", data: body });
      return ImportCommitResponseSchema.parse(response.data);
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
      ]),
  });
}

/* `last import` — the right pane's footer, which was a hard-coded string until `import_run` existed.
 *
 * `null` is a real answer and not a loading state: an account that has never imported has no last
 * import, and the pane says so rather than printing zeroes under an invented date. */
function useLastImport() {
  const { privateRequest } = useRequestHelper();
  // The gate, not a parameter — see `useAlarms` (COS-306).
  const isSignedIn = Boolean(useAuth().user?.id);

  const lastImport = useQuery({
    queryKey: queryKeys.bookmarks.lastImport(),
    queryFn: async () => {
      const response = await privateRequest("/bookmarks/import/last");
      return LastImportResponseSchema.parse(response.data).lastImport;
    },
    enabled: isSignedIn,
  });

  return {
    lastImport: lastImport.data ?? null,
    isLoading: lastImport.isLoading,
  };
}

export { useImportCommit, useImportParse, useLastImport };
