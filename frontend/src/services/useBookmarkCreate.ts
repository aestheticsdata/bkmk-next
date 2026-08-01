"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { BookmarkMutationResponseSchema } from "@src/schemas/bookmarks";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateBookmarkPayload } from "@src/schemas/bookmarks";

/** The payload, plus the one part of the form that is not data: the file. It stays out of
 *  `CreateBookmarkPayloadSchema` because a `File` is a browser object and that schema describes the
 *  record — the file is how a screenshot travels, not a field of the bookmark. */
type CreateBookmarkInput = CreateBookmarkPayload & { screenshot?: File | null };

/* Creating a record (COS-302).
 *
 * ⚠️ **The multipart body is assembled here, and this is the only place that knows its shape.**
 * `postBookmarkController` reads `req.body` after multer, where every field is a **string**: so
 * `categories` goes out as JSON encoded into one, numbers are stringified, and a field that is
 * simply absent is how "not set" is expressed. `CreateBookmarkPayloadSchema` describes the logical
 * object *before* that flattening — its header says as much — and this function is the flattening.
 * The legacy `useBookmarks.createBookmark` had it inside the form, in a `for…in` over the values
 * with a branch per field name; the note it left behind (`describing it properly belongs with the
 * form`) is this ticket.
 *
 * **Three fields are always sent, even empty**, because the API's schema requires them: `title`,
 * `stars` and `priority` — `""` is the priority the controller turns into `NULL`, and it is a value,
 * not an absence — plus `categories`, which is `"[]"` when there are none. `url`, `notes`, `reminder`
 * and the file are sent only when they have something in them.
 *
 * ⚠️ **`notes` is sent as it was typed, and it used to be percent-encoded** (COS-334). The legacy form
 * encoded every field, this kept doing it for notes so that a new row would read like the rows
 * already there, and seven screens undid it on the way out. The column holds the text itself now —
 * `2026-08-01-decode-text.js` decoded what was in it — so the encode is gone from here and the
 * decodes are gone from them. The API's bound came down with it: it was three times the front's to
 * carry the swelling, and an accented character costs one character again.
 *
 * **No `Content-Type` header.** The legacy service set `multipart/form-data` by hand, which is a
 * media type with no boundary in it; axios happens to correct that for a `FormData` body, and
 * leaving it to the browser is how it is meant to work.
 *
 * `invalidation` is the index's whole set: a new record changes the pages and the chrome's counter,
 * it can create a category the rail does not know about, and it can arm an alarm the reminders
 * screen should show. */
const toBookmarkFormData = (input: CreateBookmarkInput): FormData => {
  const body = new FormData();

  body.append("title", input.title);
  body.append("stars", String(input.stars));
  body.append("priority", input.priority ?? "");
  body.append("categories", JSON.stringify(input.categories));

  if (input.url) body.append("url", input.url);
  if (input.notes) body.append("notes", input.notes);
  if (input.reminder != null) body.append("reminder", String(input.reminder));
  if (input.screenshot) body.append("screenshot", input.screenshot);

  return body;
};

function useBookmarkCreate() {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async (input: CreateBookmarkInput) => {
      const response = await privateRequest("/bookmarks", { method: "POST", data: toBookmarkFormData(input) });
      // The boundary. The answer is an acknowledgement and nothing else — the new record's id is not
      // in it, which is why committing goes back to the index rather than to the record.
      return BookmarkMutationResponseSchema.parse(response.data);
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all }),
      ]),
  });
}

export { toBookmarkFormData, useBookmarkCreate };

export type { CreateBookmarkInput };
