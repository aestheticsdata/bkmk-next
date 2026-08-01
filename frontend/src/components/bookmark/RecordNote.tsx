import { Overline } from "@components/ds/Overline";
import { RECORD_TEXT } from "@text/record";

/* The note (COS-301) — the record's only free text, and the only thing on this screen the owner
 * wrote by hand.
 *
 * ⚠️ **The legacy screen rendered it through `dangerouslySetInnerHTML`.** It ran a regex over the
 * note and replaced every url with an `<a>` built by string concatenation, then injected the result.
 * That is stored XSS: the note is user input, the substitution escapes nothing, and `<img
 * onerror=…>` typed into a note would run on this page. It is not carried over — the links are real
 * elements built from the split, so the surrounding text can only ever be text.
 *
 * The behaviour survives because it earns its keep: notes in this index are full of urls, and a note
 * is where you put the link you did not want to make a record of.
 *
 * `whitespace-pre-wrap` keeps the line breaks the author typed.
 *
 * ⚠️ **`decodeNote` was here, and its `try/catch` was the point of it** (COS-334). Notes went into the
 * database percent-encoded, this screen undid it, and `decodeURIComponent` throws on a `%` that is
 * not an escape — a note that simply says `100%` would have taken the record screen down with it. The
 * column holds the text itself now, so there is nothing to undo and nothing to guard: a note that
 * says `100%` is a note that says `100%`. That is also why the line breaks survive — `%0A` was
 * something this decode had to turn back into one. */

/** A url, stopping before trailing sentence punctuation: `see https://x.dev/a.` links `…/a`, not
 *  `…/a.`. The capture group is what makes `split` keep the matches. */
const URL_PATTERN = /(https?:\/\/[^\s]*[^\s.,;:!?)\]])/g;

/** Segments with their offset in the note, so each one has a key that is not its array index.
 *
 *  A segment is a link when it opens with the scheme — and testing the string rather than re-running
 *  `URL_PATTERN` is not a shortcut: a global regex carries `lastIndex` between calls, so `.test()` on
 *  it would answer differently for the same input depending on what came before. Only the split can
 *  produce these pieces, so a piece that starts with `http://` is one it matched. */
function segments(note: string): { text: string; isLink: boolean; at: number }[] {
  let at = 0;
  return note
    .split(URL_PATTERN)
    .filter(Boolean)
    .map((text) => {
      const segment = { text, isLink: text.startsWith("http://") || text.startsWith("https://"), at };
      at += text.length;
      return segment;
    });
}

function RecordNote({ note }: { note?: string | null }) {
  const text = note ?? "";

  return (
    <>
      <Overline className="mt-5.5 mb-2 block">{RECORD_TEXT.sections.note}</Overline>
      {text ? (
        <p className="max-w-155 whitespace-pre-wrap break-words leading-relaxed text-gr-fg">
          {segments(text).map((segment) =>
            segment.isLink ? (
              <a
                key={segment.at}
                href={segment.text}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all rounded-sm text-gr-accent underline underline-offset-2 outline-none hover:text-gr-fg-2 hover:no-underline focus-visible:ring-3 focus-visible:ring-gr-ring"
              >
                {segment.text}
              </a>
            ) : (
              <span key={segment.at}>{segment.text}</span>
            ),
          )}
        </p>
      ) : (
        <p className="text-gr-fg-4">{RECORD_TEXT.values.emptyNote}</p>
      )}
    </>
  );
}

export { RecordNote };
