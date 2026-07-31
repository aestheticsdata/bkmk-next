/* ⚠️ **This file is what closes the modal when you navigate away, and it is not optional** (COS-319).
 *
 * A client navigation only re-renders the slots that match the new URL. Leave `/bookmarks/42/edit`
 * by a `<Link>` — the index tab, the record's breadcrumb, anything — and the `@modal` slot has no
 * page for the new address, so React keeps rendering **the last one it had**: the edit modal stays
 * on screen over a screen it has nothing to do with. `default.tsx` does not cover this, because it
 * only answers on a fresh load.
 *
 * A catch-all matching everything under the slot gives every other address an answer, and the answer
 * is nothing. The intercepting route is more specific, so it still wins on the address it is for.
 *
 * `Promise` params and no `await`: the segment is matched and thrown away — this component's whole
 * job is to render `null` at the right moment. */
export default function ModalCatchAll() {
  return null;
}
