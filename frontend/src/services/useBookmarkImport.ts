"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { ImportResponseSchema } from "@src/schemas/import";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* Sending the import file (COS-303).
 *
 * ⚠️ **The upload is still direct, and the staging on screen is a preview of it.** The handoff draws
 * a staged table and three options, which implies a parse endpoint that writes nothing followed by a
 * commit that takes the retained entries — that is DATA 02 (COS-307). Until it exists there is one
 * call, `POST /bookmarks/upload`, and it takes the file and imports every line of it. So `send`
 * sends the file, exactly as the legacy screen did; what changed is that you can see what is in it
 * first.
 *
 * `ImportResponseSchema` is what the endpoint answers **today**: a message, plus on failure the url
 * or title whose insert blew up. `ImportSummarySchema` beside it in the same file describes the
 * report COS-307 will return, and stays unwired until then — the comment PLAT 05 left on it said as
 * much.
 *
 * The invalidation is the index's and nothing more: an import writes `bookmark` and `url` rows and
 * touches neither categories nor alarms. */
function useBookmarkImport() {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      // The field name is the backend's: `upload.single("bookmark_file")`.
      body.append("bookmark_file", file);

      const response = await privateRequest("/bookmarks/upload", { method: "POST", data: body });
      return ImportResponseSchema.parse(response.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all }),
  });
}

export { useBookmarkImport };
