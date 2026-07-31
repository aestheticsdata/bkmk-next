import { tagHue } from "@components/bookmarks/helpers/tagHue";
import { Chip } from "@components/ds/Chip";
import { KeyValueTable } from "@components/ds/KeyValueTable";
import { PriorityBars } from "@components/ds/PriorityBars";
import { Stars } from "@components/ds/Stars";
import { RECORD_TEXT } from "@text/record";
import { format } from "date-fns";

import type { KeyValueRow } from "@components/ds/KeyValueTable";
import type { BookmarkDetail } from "@src/schemas/bookmarks";

/* `fields` (COS-301) — everything the record holds that is not its title, its note or its
 * screenshot, in the handoff's order.
 *
 * **Seven rows, and the handoff's eighth is not one of them.** `hash` is a column the database does
 * not have; the ticket and §8.2 of the spec both say to ship it hidden rather than invent a digest,
 * and DATA 04 (COS-309) adds the row when the column exists.
 *
 * Every value is drawn with the primitive the index already uses for it — `PriorityBars`, `Stars`,
 * `Chip` — so a record reads the same way in a row and on its own page. The exception is `tags`,
 * which shows **all** of them here: the row stops at three because the column is 188px wide, and this
 * is the screen where you find out what the fourth one was. */
function RecordFields({ record }: { record: BookmarkDetail }) {
  const none = <span className="text-gr-fg-4">{RECORD_TEXT.values.none}</span>;

  const rows: KeyValueRow[] = [
    {
      label: RECORD_TEXT.fields.url,
      value: record.original_url ? (
        <a
          href={record.original_url}
          target="_blank"
          rel="noopener"
          className="break-all rounded-sm text-gr-accent underline underline-offset-2 outline-none hover:text-gr-fg-2 hover:no-underline focus-visible:ring-3 focus-visible:ring-gr-ring"
        >
          {record.original_url}
        </a>
      ) : (
        none
      ),
    },
    {
      label: RECORD_TEXT.fields.added,
      // The index's format, not the legacy screen's `dd MMM yyyy` in French: one date shape across
      // the application, and the sortable one.
      value: record.date_added ? <span className="num">{format(record.date_added, "yyyy-MM-dd")}</span> : none,
    },
    {
      label: RECORD_TEXT.fields.priority,
      value: (
        <span className="flex items-center gap-2.5">
          <PriorityBars p={record.priority ?? ""} />
          <span className={record.priority ? undefined : "text-gr-fg-4"}>
            {record.priority ?? RECORD_TEXT.values.noPriority}
          </span>
        </span>
      ),
    },
    {
      label: RECORD_TEXT.fields.stars,
      value: <Stars n={record.stars} />,
    },
    {
      label: RECORD_TEXT.fields.tags,
      value:
        record.categories.length > 0 ? (
          <span className="flex flex-wrap gap-1.5">
            {record.categories.map((category) => (
              <Chip
                key={category.id}
                hue={tagHue(category)}
              >
                {category.name}
              </Chip>
            ))}
          </span>
        ) : (
          none
        ),
    },
    {
      label: RECORD_TEXT.fields.alarm,
      /* `alarm_frequency` is a number of days and `alarm_date_added` the day the count starts from —
         `getRemindersController` fires when the difference between today and that date is a multiple
         of the frequency. Both are printed because neither means much alone, and this screen is the
         only place either one is readable. */
      value: record.alarm_frequency ? (
        <span className="flex flex-wrap items-center gap-x-2">
          <span className="text-gr-accent-2">{RECORD_TEXT.values.armed(record.alarm_frequency)}</span>
          {record.alarm_date_added && (
            <span className="num text-gr-fg-4">
              {RECORD_TEXT.values.armedSince(format(record.alarm_date_added, "yyyy-MM-dd"))}
            </span>
          )}
        </span>
      ) : (
        none
      ),
    },
    {
      label: RECORD_TEXT.fields.shot,
      value: record.screenshot ? RECORD_TEXT.values.captured : none,
    },
  ];

  return <KeyValueTable rows={rows} />;
}

export { RecordFields };
