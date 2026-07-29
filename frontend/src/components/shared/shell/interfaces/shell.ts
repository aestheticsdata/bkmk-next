/* The shell's two route notions, which are not the same thing.
 *
 * `ShellScreen` is what the user is looking at — it drives the status bar's hints.
 * `ShellTab` is which of the four modules is lit in the chrome. They differ on the record
 * screen: opening a bookmark keeps `index` lit, exactly as the handoff does
 * (`Detail_Graphite` renders `<GShell active="list">`). */

export type ShellScreen = "list" | "detail" | "create" | "upload" | "reminders" | "about";

export type ShellTab = "list" | "create" | "upload" | "reminders";

/** Which real counter a tab carries, if any. `new` and `import` carry none. */
export type ShellTabCount = "bookmarks" | "reminders";

export interface ShellTabItem {
  tab: ShellTab;
  path: string;
  /** The glyph the narrow-width tab bar shows above the label. */
  glyph: string;
  count?: ShellTabCount;
}
