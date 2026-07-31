import { EditModal } from "@components/bookmarks/edit/EditModal";

/* The intercepted edit route (COS-319) — `/bookmarks/<id>/edit` reached from inside the app.
 *
 * ⚠️ **`(.)`, and it was verified rather than reasoned about.** The marker counts *route* levels:
 * `(private)` is a group and `@modal` is a slot, so neither adds one, which puts this file at the
 * root level — the same level as `bookmarks`. The ticket flagged it as the thing that most often
 * breaks and asked for `(..)` as the fallback; a throwaway pair of routes with a slot at the same
 * depth was built, navigated with a real client `<Link>`, and `(.)` matched. `(..)` did not need to
 * be tried.
 *
 * What the interception buys, all of it verified in that same experiment: the address becomes the
 * modal's, the page underneath stays mounted with its state, and a **direct** visit or a reload
 * falls through to `bookmarks/[id]/edit/page.tsx` instead.
 *
 * The id is a string all the way down: it comes from the address, the record hook keys its query on
 * it, and only the mutation's payload needs it as a number. */
export default async function InterceptedEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <EditModal id={id} />;
}
