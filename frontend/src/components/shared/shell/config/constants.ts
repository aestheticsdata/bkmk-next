import { ROUTES } from "@components/shared/config/constants";

import type { ShellTabItem } from "@components/shared/shell/interfaces/shell";

/* The four modules of the chrome, in the handoff's order: `index`, `new`, `import`,
 * `alarms`. One list, two renderers — the chrome's tab row and the narrow-width tab bar
 * both read it, so they cannot drift apart.
 *
 * Paths come from the shared `ROUTES`, which means the index link still carries
 * `?page=0`: the legacy list reads its page out of the query string and shows nothing
 * without it. COS-306 moves pagination to the server and can drop the parameter then.
 *
 * The glyphs are the handoff's, as plain text rather than lucide icons — the same call
 * DS 02 made for the row actions (`↗ ✎ ⌧`). A monospace interface draws its own
 * furniture. */
export const SHELL_TABS: readonly ShellTabItem[] = [
  { tab: "list", path: ROUTES.bookmarks.path, glyph: "▤", count: "bookmarks" },
  { tab: "create", path: ROUTES.bookmarksCreation.path, glyph: "＋" },
  { tab: "upload", path: ROUTES.bookmarksBatchUpload.path, glyph: "⤓" },
  { tab: "reminders", path: ROUTES.bookmarksReminders.path, glyph: "◔", count: "reminders" },
] as const;

/** Counters are printed on three digits, as the handoff does: `index 312`, `alarms 004`. */
export const COUNTER_DIGITS = 3;
