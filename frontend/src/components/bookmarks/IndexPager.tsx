"use client";

import { readSort, toIndexHref } from "@components/bookmarks/helpers/indexQuery";
import { PagerBar } from "@components/ds/CommandBar";
import { Overline } from "@components/ds/Overline";
import { ROWS_BY_PAGE } from "@components/shared/config/constants";
import { Button } from "@components/ui/button";
import { INDEX_TEXT } from "@text/index";
import Link from "next/link";

import type { FiltersQuery } from "@src/schemas/filters";

/* The pager (COS-299): which page, of how many, and which rows of the total.
 *
 * The numbers are padded to a fixed width — `page 00/57`, `rows 001–022 of 1290` — which is the
 * handoff's, and not only a look: a counter that changes width makes the bar twitch on every page turn.
 *
 * ⚠️ **Both arrows are always rendered, and the unavailable one is `disabled`.** They were absent at
 * the ends first, with a spacer holding the gap — and the spacer was square while the button is wider
 * than it is tall, so arriving on page 1 shoved `page 01` sideways. Nothing in a pager may move when
 * you use it. A disabled button holds its own geometry exactly, which is the whole reason to prefer it
 * to any placeholder, and at the ends of a pager it is also the conventional answer.
 *
 * ⚠️ **The last page number is a link**, as it was in the legacy pager: `/57` jumps to the end. It is
 * the only way to reach the oldest records in fewer than 57 clicks until a filter narrows them.
 *
 * The page count is computed here, from `total_count`. DATA 01 (COS-306) is to return
 * `{ rows, total, page, pageCount }`; until then this division is the honest way to the same number,
 * and it lives in one place so that ticket has one line to replace. */
function IndexPager({
  query,
  pathname,
  total,
  shown,
}: {
  query: FiltersQuery;
  pathname: string;
  total?: number;
  /** Rows actually on this page — the last page is rarely full. */
  shown: number;
}) {
  const page = query.page;
  const pageCount = total == null ? undefined : Math.max(1, Math.ceil(total / ROWS_BY_PAGE));
  /** Zero-based, like `?page=`: the index of the last page, which is what the pager shows. */
  const lastPage = pageCount == null ? undefined : pageCount - 1;
  const first = page * ROWS_BY_PAGE + 1;
  const last = page * ROWS_BY_PAGE + shown;
  const sort = readSort(query.sort);

  /** Both numbers are padded to the width of the last one, so `page 09` → `page 10` moves nothing. */
  const width = Math.max(2, String(lastPage ?? 0).length);
  const padded = (value: number) => String(value).padStart(width, "0");

  return (
    <PagerBar>
      <div className="flex items-center gap-2">
        <PagerArrow
          href={page > 0 ? toIndexHref(pathname, query, { page: page - 1 }) : undefined}
          label={INDEX_TEXT.pager.previous}
        >
          ←
        </PagerArrow>

        <span className="text-2xs tabular-nums text-gr-fg-2">
          {INDEX_TEXT.pager.page} <span className="font-semibold">{padded(page)}</span>
          {lastPage != null && (
            <>
              <span className="text-gr-fg-4">/</span>
              {page === lastPage ? (
                <span className="text-gr-fg-4">{padded(lastPage)}</span>
              ) : (
                <Link
                  href={toIndexHref(pathname, query, { page: lastPage })}
                  title={INDEX_TEXT.pager.lastPage}
                  className="rounded-sm text-gr-fg-4 outline-none hover:text-gr-fg-2 focus-visible:ring-3 focus-visible:ring-gr-ring"
                >
                  {padded(lastPage)}
                </Link>
              )}
            </>
          )}
        </span>

        <PagerArrow
          href={lastPage != null && page < lastPage ? toIndexHref(pathname, query, { page: page + 1 }) : undefined}
          label={INDEX_TEXT.pager.next}
        >
          →
        </PagerArrow>
      </div>

      {total != null && shown > 0 && (
        <Overline className="tabular-nums @max-3xl:hidden">
          {INDEX_TEXT.command.rows} {String(first).padStart(3, "0")}–{String(last).padStart(3, "0")} of {total}
        </Overline>
      )}

      <Overline className="ml-auto whitespace-nowrap">
        {INDEX_TEXT.pager.sortedBy} {INDEX_TEXT.sortLabels[sort.column] ?? sort.column}{" "}
        <span aria-hidden>{sort.descending ? INDEX_TEXT.command.descending : INDEX_TEXT.command.ascending}</span>
      </Overline>
    </PagerBar>
  );
}

/** One arrow. With a `href` it is a link — middle-click, ⌘-click, the status bar preview; without one
 *  it is the same button, disabled, occupying exactly the same box. */
function PagerArrow({ href, label, children }: { href?: string; label: string; children: string }) {
  if (href == null) {
    return (
      <Button
        variant="chrome"
        size="page"
        disabled
        aria-label={label}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant="chrome"
      size="page"
      title={label}
    >
      <Link
        href={href}
        aria-label={label}
      >
        {children}
      </Link>
    </Button>
  );
}

export { IndexPager };
