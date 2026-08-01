"use client";

import { useAuth } from "@auth/context/AuthContext";
import { useDebouncedValue } from "@helpers/useDebouncedValue";
import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { DuplicateCandidatesSchema } from "@src/schemas/bookmarks";
import { useQuery } from "@tanstack/react-query";

/** How long the field waits after the last keystroke before asking. The filter modal's figure, for
 *  the same reason and against the same kind of field: long enough that a pasted url costs one
 *  request, short enough that the answer feels attached to what was typed. */
const DEBOUNCE_MS = 300;

/* Records the index already holds for the url being typed (COS-308).
 *
 * This is what makes the create screen's right pane say `2 duplicate candidates in index` about the
 * index rather than about the mockup — the count was hard-coded there until now (COS-329 §2).
 *
 * **The question is answered on the server**, on `url.normalised`, because the normal form is a rule
 * the browser does not have: `helpers/normaliseUrl` lives in the backend, and the import's staging
 * asks the same question through the same helper. Sending the raw url and letting one definition
 * answer is what keeps the two screens from drifting.
 *
 * **Debounced on the url, and only asked when there is one.** The pane's line is about a link; with
 * the field empty there is nothing to be a duplicate of, and `enabled` is what says so rather than a
 * request that would come back `0` a hundred milliseconds later.
 *
 * **`placeholderData` keeps the previous answer under the line while the next one loads**, the
 * filter count's trick. Without it the warning disappears and comes back on every settled keystroke,
 * which on a block that grows a list of links is the bottom of the pane jumping.
 *
 * `retry: false`: this is an aside on a form, not the form. If the lookup fails, the pane says
 * nothing rather than three times nothing — the commit is unaffected either way.
 */
function useDuplicateCandidates(url: string) {
  const { privateRequest } = useRequestHelper();
  // The gate, not a parameter — see `useBookmarkIndex` (COS-306).
  const isSignedIn = Boolean(useAuth().user?.id);

  const trimmed = url.trim();
  const settledUrl = useDebouncedValue(trimmed, DEBOUNCE_MS);

  const duplicates = useQuery({
    queryKey: queryKeys.bookmarks.duplicates(settledUrl),
    queryFn: async () => {
      const response = await privateRequest(`/bookmarks/duplicates?url=${encodeURIComponent(settledUrl)}`);
      return DuplicateCandidatesSchema.parse(response.data);
    },
    enabled: isSignedIn && settledUrl !== "",
    retry: false,
    placeholderData: (previous) => previous,
  });

  return {
    count: duplicates.data?.count ?? 0,
    candidates: duplicates.data?.candidates ?? [],
    /** True while what is on screen is not yet the answer to what is in the field. The line is drawn
     *  from the previous answer meanwhile, so this is what lets the caller say so. */
    isStale: duplicates.isFetching || settledUrl !== trimmed,
    /** Nothing has been asked yet: the field is empty, or nobody is signed in. */
    isIdle: settledUrl === "",
    isError: duplicates.isError,
  };
}

export { useDuplicateCandidates };
