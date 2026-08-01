"use client";

import { ROUTES } from "@components/shared/config/constants";
import { useDuplicateCandidates } from "@src/services/useDuplicateCandidates";
import { CREATE_TEXT } from "@text/create";
import { format } from "date-fns";
import Link from "next/link";

/* The duplicate warning under the record readout (COS-308).
 *
 * The handoff draws one line — `2 duplicate candidates in index · review before commit` — and until
 * this ticket that `2` was a constant in `CREATE_TEXT.mock`, because nothing looked. It looks now,
 * on `url.normalised`, so the same page reached with `www.`, a trailing slash or a `?utm_source=` is
 * the same page. `useDuplicateCandidates` is where the request lives.
 *
 * ⚠️ **The candidates are listed, which the mockup does not do, and the reason is its own last
 * three words.** "Review before commit" is an instruction you cannot follow from a number: you have
 * to be able to see what it counted. They are the smallest thing that makes the line actionable —
 * one row each, the title and the day it was saved.
 *
 * ⚠️ **Each row opens in a new tab.** Reviewing a duplicate means leaving a form that is filled in,
 * and this application has no draft that survives a navigation. A link that throws away what you
 * typed is worse than no link.
 *
 * **`no duplicate in index` is drawn too, rather than nothing.** An absent block cannot be told from
 * a check that has not run, and "the index does not have this yet" is precisely what someone filling
 * in this form wants to know. With the field empty there is genuinely nothing to say, and that is
 * the one case the block disappears in.
 *
 * The previous answer stays under the line while the next one loads (`placeholderData` in the hook),
 * so a settled keystroke does not make the bottom of the pane blink between two heights. A failed
 * lookup draws nothing at all: it is an aside on a form, and the commit does not depend on it.
 */
function InsertDuplicates({ url }: { url: string }) {
  const { count, candidates, isIdle, isError } = useDuplicateCandidates(url);

  if (isIdle || isError) return null;

  const hidden = count - candidates.length;

  return (
    <div className="grid gap-1.5 border-t border-gr-border pt-3 text-3xs text-gr-fg-4">
      <p>
        {count === 0 ? (
          CREATE_TEXT.duplicates.none
        ) : (
          <>
            {CREATE_TEXT.duplicates.found(count)} · {CREATE_TEXT.duplicates.review}
          </>
        )}
      </p>

      {candidates.map((candidate) => (
        <Link
          key={candidate.id}
          href={`${ROUTES.bookmarksRecord.path}/${candidate.id}`}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-baseline gap-2 rounded-sm text-gr-fg-3 outline-none hover:text-gr-fg-2 focus-visible:ring-3 focus-visible:ring-gr-ring"
        >
          {/* The title takes what is left and truncates into it, as the index row's does — a long
              title must not push the date out of a 340px pane. */}
          <span className="min-w-0 truncate">{candidate.title || CREATE_TEXT.duplicates.untitled}</span>
          {candidate.addedAt && (
            <span className="shrink-0 tabular-nums text-gr-fg-4">{format(candidate.addedAt, "yyyy-MM-dd")}</span>
          )}
        </Link>
      ))}

      {hidden > 0 && <p>{CREATE_TEXT.duplicates.more(hidden)}</p>}
    </div>
  );
}

export { InsertDuplicates };
