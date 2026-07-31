/* The modal slot when nothing is intercepted (COS-319).
 *
 * A parallel slot has to answer for every route, and `default.tsx` is what it renders when the
 * current URL does not match anything inside it — on a hard load, and on any route the slot has no
 * page for. Without it, reloading `/bookmarks` would 404: Next cannot render a layout whose slot has
 * no match and no default.
 *
 * `null`, because a slot with no modal in it is not a piece of UI. */
export default function ModalDefault() {
  return null;
}
