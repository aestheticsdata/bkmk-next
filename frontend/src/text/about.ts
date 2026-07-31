/* The About screen's copy (COS-305). Same convention as `@text/auth.ts`: text lives here rather
 * than inside the component, in English, with no locale segment.
 *
 * **The page carries the legal notice and nothing else** — the four lines the old screen had, which
 * exist nowhere else in the application. The handoff's `About_Graphite` draws a product page around
 * them (a pitch, a keyboard table, a system panel, `sign out`); none of that is this page's job,
 * and most of it could not be true on a page served without a session anyway.
 *
 * The values are the host's own, unchanged. The labels are the interface's language, like every
 * other label in the system. */

export const ABOUT_TEXT = {
  /** The chrome's screen label, where the two auth screens say `auth`. */
  screen: "about",

  overline: "about",
  title: "legal notice",

  rows: [
    { label: "host", value: "OVH SAS" },
    { label: "office", value: "2 rue Kellermann, 59100 Roubaix, France" },
    { label: "ape", value: "2620Z" },
    { label: "vat", value: "FR 22 424 761 419" },
  ],

  /** Without a session there is one place to go, and it is the door. */
  back: "‹ back to sign in",
  /** With one, going "back" to the sign-in screen would mean leaving the app to read a notice. */
  backToIndex: "‹ back to the index",
} as const;
