"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { PageTitleSchema } from "@src/schemas/bookmarks";
import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { useMutation } from "@tanstack/react-query";

/* The title of the page a draft points at (COS-329).
 *
 * The handoff writes `auto-fetched from <title>` under the create screen's `title` field. Nothing
 * fetched anything, so UI 06 rewrote the placeholder to say what the field *is* rather than promise
 * something on every insert; this is the ticket that lets the promise be made, and the placeholder
 * goes back to the handoff's words with it.
 *
 * **It goes through the API, not the browser.** A page's `<title>` is another origin's document and
 * CORS is the whole reason: `fetch("https://youtube.com/…")` from this component reads nothing back.
 * The route is `GET /bookmarks/page-title`, and everything difficult about it — the address guard, the
 * redirect chain, the ceilings, the charset — lives in `helpers/fetchPageTitle` on the server.
 *
 * ⚠️ **A mutation and not a query, unlike `useDuplicateCandidates` next door.** That one asks about
 * whatever is in the field on every settled keystroke, so it is a value derived from the url and it
 * caches. This one is an **action taken once**, when the url field is left, and it must not re-fire
 * because something re-rendered — a query keyed on the url would re-ask the moment its entry fell out
 * of cache, which is a request to a stranger's server for nothing. The caller decides when; this
 * decides how.
 *
 * `retry: false` for the reason the duplicate lookup has it: this is an assist on a form, not the
 * form. A host that did not answer is a field that stays empty, and asking it three times makes the
 * emptiness slower to arrive rather than less likely.
 */
function usePageTitle() {
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async (url: string) => {
      const response = await privateRequest(`/bookmarks/page-title?url=${encodeURIComponent(url)}`);
      const { title } = PageTitleSchema.parse(response.data);

      /* Trimmed to the column here rather than at the field. `bookmark.title` is `VARCHAR(512)` and a
       * page is free to have a longer `<title>` than that — nothing on the web stops it. Left whole
       * it would pass this boundary, fill the input, and then be refused by the commit's own schema
       * with `required` beside a field that visibly has something in it. */
      return title ? title.slice(0, FIELD_LIMITS.title) : null;
    },
    retry: false,
  });
}

export { usePageTitle };
