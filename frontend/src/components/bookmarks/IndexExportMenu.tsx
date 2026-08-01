"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { EXPORT_FORMATS } from "@src/schemas/bookmarks";
import { useBookmarkExport } from "@src/services/useBookmarkExport";
import { INDEX_TEXT } from "@text/index";

/* The way out of the index (COS-333).
 *
 * bkmk knew how to import and not how to export: the only readable copy of an account's records was
 * a `mysqldump` shipped over SFTP twice a day. Three formats, chosen for who reads them — `json` is
 * faithful to the database, `csv` is what this application's own import reads back, `html` is what
 * browsers read.
 *
 * ⚠️ **The handoff draws no export control**, so this is placed rather than copied. The command bar,
 * because that bar is what the index is looked at through, and beside `filter`, which is the other
 * control that acts on the list as a whole. The About screen — the ticket's other suggestion — is
 * served without a session and could not carry a control that needs one.
 *
 * ⚠️ **The menu says `the whole index` before it is opened.** The bar right beside it can be carrying
 * a filter, and an export that quietly handed over the filtered subset is the one mistake a backup
 * must not make. Exporting a filter is a different feature and needs a surface that shows which one
 * is applied.
 *
 * The download itself is `useBookmarkExport`, which fetches the blob rather than pointing an anchor
 * at the endpoint — an anchor would slip past the session check and save a login page under the name
 * of an export.
 */
function IndexExportMenu() {
  const exportIndex = useBookmarkExport();

  return (
    <DropdownMenu>
      {/* The `chrome` button's own styling, written out rather than borrowed from `ui/button`: this
          is a menu trigger, so it needs Radix's `data-[state=open]` to stay lit while the menu is
          open — the same treatment `UserMenu`'s trigger gets in the top chrome. */}
      <DropdownMenuTrigger
        disabled={exportIndex.isPending}
        className="flex h-6.5 shrink-0 items-center gap-1.5 rounded-md border border-gr-border bg-gr-raise px-2 text-2xs text-gr-fg-2 transition-colors duration-120 outline-none hover:border-gr-border-2 hover:text-gr-fg focus-visible:border-gr-accent focus-visible:ring-3 focus-visible:ring-gr-ring disabled:opacity-60 data-[state=open]:border-gr-accent"
      >
        {exportIndex.isError ? INDEX_TEXT.export.failed : INDEX_TEXT.export.button}
        {exportIndex.isPending && (
          <span
            aria-hidden
            className="text-gr-fg-4"
          >
            {INDEX_TEXT.export.busy}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel>{INDEX_TEXT.export.caption}</DropdownMenuLabel>

        {EXPORT_FORMATS.map((format) => (
          <DropdownMenuItem
            key={format}
            onSelect={() => exportIndex.mutate(format)}
          >
            {INDEX_TEXT.export.formats[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { IndexExportMenu };
