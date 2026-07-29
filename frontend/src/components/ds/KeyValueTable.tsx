import { cn } from "@lib/utils";
import { Fragment } from "react";

import type * as React from "react";

/* `.gr-kv` — the record's metadata: url, added, priority, stars, alarm. A two-column
 * grid with a rule under every row.
 *
 * A `<dl>`, not a `<table>` and not a stack of divs: this is a description list in the
 * literal sense, and the element gives the pairing to assistive technology for free.
 *
 * The grid runs on the `<dl>` itself, so every `dt` and `dd` has to be a direct child —
 * hence rows as data rather than as children, and `Fragment` rather than a wrapper
 * element to group each pair. One `<div>` per row here would collapse the two columns
 * into one.
 *
 * The label column is a fixed 104px so every value starts on the same line, dropping to
 * 88px on narrow widths. Both expressed through `--spacing()` rather than as raw pixels,
 * so they stay on the same scale as the rest of the system. */
type KeyValueRow = { label: string; value: React.ReactNode };

function KeyValueTable({
  rows,
  className,
  ...props
}: Omit<React.ComponentProps<"dl">, "children"> & { rows: KeyValueRow[] }) {
  return (
    <dl
      data-slot="key-value-table"
      className={cn(
        "grid grid-cols-[--spacing(26)_1fr] gap-x-4 text-xs @max-3xl:grid-cols-[--spacing(22)_1fr]",
        "[&>*]:border-b [&>*]:border-gr-border [&>*]:py-1.75",
        className,
      )}
      {...props}
    >
      {rows.map((row) => (
        <Fragment key={row.label}>
          <dt className="text-gr-fg-3">{row.label}</dt>
          <dd className="text-gr-fg-2">{row.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

export { KeyValueTable };

export type { KeyValueRow };
