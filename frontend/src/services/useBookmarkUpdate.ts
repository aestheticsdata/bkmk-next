"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { BookmarkMutationResponseSchema } from "@src/schemas/bookmarks";
import { toBookmarkFormData } from "@src/services/useBookmarkCreate";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateBookmarkInput } from "@src/services/useBookmarkCreate";

/** The create payload, plus the two things only an edit has: which record, and whether the
 *  screenshot it already had is going. */
type UpdateBookmarkInput = CreateBookmarkInput & { id: number; deleteScreenshot?: boolean };

/** ⚠️ **A word, not a boolean, and only ever appended when true.** A multipart body carries strings
 *  and `"false"` is truthy, so a flag sent unconditionally would erase a screenshot on every save.
 *  `updateBookmarkBodySchema` describes it as an optional string for that reason, and
 *  `editBookmarkController` compares it to this exact value. */
const DELETE_SCREENSHOT = "delete";

/* Saving a record (COS-319).
 *
 * **The body is the create body plus two fields**, which is why the flattening is imported rather
 * than written again: `PUT /bookmarks` and `POST /bookmarks` read the same shape through the same
 * multer, and two copies of that knowledge would drift the first time a field is added. See
 * `toBookmarkFormData` for what "the same shape" means — everything is a string, `categories` is
 * JSON inside one, and an absent field is how "not set" is expressed.
 *
 * ⚠️ **The record's id travels in the body, not in the path.** The route is `PUT /bookmarks` with no
 * segment; that is the API as it stands, and moving it belongs with the DATA lot rather than with a
 * screen. The controller now scopes its read to the session's user, so the id in the body can no
 * longer name someone else's record.
 *
 * `invalidation` is the widest of any mutation here, and each entry earns it: a save changes the
 * index's pages, the record itself, the categories (it can create one), and the alarms (it can arm,
 * re-time or remove a reminder). */
function useBookmarkUpdate() {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async (input: UpdateBookmarkInput) => {
      const body = toBookmarkFormData(input);
      body.append("id", String(input.id));
      if (input.deleteScreenshot) body.append("deleteScreenshot", DELETE_SCREENSHOT);

      const response = await privateRequest("/bookmarks", { method: "PUT", data: body });
      return BookmarkMutationResponseSchema.parse(response.data);
    },
    onSuccess: (_data, input) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.detail(input.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all }),
      ]),
  });
}

export { useBookmarkUpdate };

export type { UpdateBookmarkInput };
