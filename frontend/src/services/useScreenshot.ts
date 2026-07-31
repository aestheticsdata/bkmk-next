"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

/* The record's screenshot (COS-301).
 *
 * `bookmark.screenshot` is a **filename**, not an image: the file lives on the API's disk, and
 * `GET /bookmarks/upload/:id` reads it and answers with the whole thing base64-encoded into a
 * `data:` URL. So this is one request per record that has one, and its answer is large — hence its
 * own cache entry, keyed by the filename, rather than travelling with the record's metadata.
 *
 * The boundary check is small but not skippable: the response is dropped straight into an `<img>`
 * `src`, so it has to be a `data:image/…` URL and nothing else. A `javascript:` or `data:text/html`
 * string in that attribute is script that runs.
 *
 * Written beside the legacy `@helpers/getScreenshot`, which the reminders screen and the edit form
 * still use — that one carries its result in `useState` behind an effect, refetches on every render
 * of a new object, and types the bookmark as `any`. */
const dataUrlSchema = z.string().regex(/^data:image\/[\w.+-]+;base64,/, "not an image data url");

function useScreenshot(record?: { id: number; user_id: number; screenshot?: string | null }) {
  const { privateRequest } = useRequestHelper();
  const filename = record?.screenshot ?? "";

  const shot = useQuery({
    queryKey: queryKeys.bookmark.screenshot(record?.id ?? "", filename),
    queryFn: async () => {
      const response = await privateRequest(
        `/bookmarks/upload/${record?.id}?screenshotFilename=${encodeURIComponent(filename)}&userID=${record?.user_id}`,
      );
      return dataUrlSchema.parse(response.data);
    },
    enabled: Boolean(record && filename),
    retry: false,
    /* The file does not change under a given name — a re-capture writes a new one, which is a new
     * key. Nothing is gained by asking for a megabyte of base64 twice in a session. */
    staleTime: Number.POSITIVE_INFINITY,
  });

  return {
    imageUrl: shot.data,
    isLoading: shot.isLoading && Boolean(filename),
    isError: shot.isError,
  };
}

export { useScreenshot };
