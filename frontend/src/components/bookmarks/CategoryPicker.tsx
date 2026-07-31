"use client";

import { Overline } from "@components/ds/Overline";
import { Segment } from "@components/ds/Segment";
import { cn } from "@lib/utils";
import { INDEX_TEXT } from "@text/index";

import type { Category } from "@src/schemas/categories";

/** How many categories the row under the field ever shows — the ten most used, or the ten best
 *  matches. Ten is the owner's figure and it is also one row at every width the modal has. */
const MAX_SUGGESTIONS = 10;

/* Picking categories, for a user who has fifty-three of them (COS-300).
 *
 * ⚠️ **This replaced a cloud of every category, and the difference is the whole point.** The first
 * version drew all fifty-three as chips: seven rows, 204px, capped and scrolled — "un gros pavé
 * indigeste", and correctly so. Nobody reads fifty-three pills to find `dev`. The legacy app had a
 * plain multi-select and it was better.
 *
 * So: a **token field you type into**, and **one row of suggestions** under it. Two states, one row:
 *
 * - nothing typed → the **ten most used**, ranked by `bookmarks_count`. On the live index that is
 *   `dev 960`, `youtube 916`, then a long tail — so the two categories that matter are one click away
 *   and the ranking is a real number, not a guess. See `getCategoriesController`.
 * - typing → the **ten best matches**, alphabetical, with the total when there are more than ten.
 *
 * Whatever is selected stays visible as a token in the field regardless, so a category outside the top
 * ten cannot be selected-but-invisible.
 *
 * **No floating listbox, and that is deliberate.** A dropdown inside a modal whose panel is itself the
 * scroll container gets clipped by that panel or needs a portal and a second focus scope to escape it.
 * A row that changes content needs neither, is one line at every width, and is the same `Segment` the
 * rest of the modal is built from. `↵` adds the first suggestion, which is the only thing a listbox
 * would have bought here.
 *
 * It is not `role="combobox"` for the same reason: with no listbox to own, claiming the role would
 * describe a widget that is not there. It is a labelled search input followed by buttons. */
function CategoryPicker({
  categories,
  selected,
  onChange,
  search,
  onSearchChange,
}: {
  categories: Category[];
  selected: number[];
  /** The full next selection — the caller owns the draft. */
  onChange: (next: number[]) => void;
  /* ⚠️ **The search string is the caller's, not this component's**, and only for `esc`.
   *
   * It lived here first. It could not stay: `esc` has to clear the field *without* closing the modal,
   * and the only supported way to cancel that dismissal is `onEscapeKeyDown` on `DialogContent` — a
   * prop of a component two levels up. Radix's dismiss listener sits on `document` in the **capture**
   * phase, so it runs before the event reaches this input and no amount of `stopPropagation` down here
   * gets in front of it. That was the first attempt and the modal closed anyway.
   *
   * So the state lifts to where the escape handler is, and this stays a controlled field. */
  search: string;
  onSearchChange: (search: string) => void;
}) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const tokens = selected.map((id) => byId.get(id)).filter((category): category is Category => category != null);

  const needle = search.trim().toLowerCase();
  const matches = needle
    ? categories.filter((category) => category.name.toLowerCase().includes(needle))
    : /* `toSorted`, not `sort`: `categories` is the react-query cache's array and sorting in place
         would reorder the rail too. Ties break on the name so the row is stable between renders. */
      categories.toSorted((a, b) => b.bookmarks_count - a.bookmarks_count || a.name.localeCompare(b.name));
  const suggestions = matches.slice(0, MAX_SUGGESTIONS);

  const toggle = (id: number) =>
    onChange(selected.includes(id) ? selected.filter((current) => current !== id) : [...selected, id]);

  /* `↵` adds the first suggestion, `⌫` on an empty field removes the last token — the two gestures a
   * token field is expected to have. `esc` is **not** here; see the note on the `search` prop. */
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && suggestions.length > 0) {
      // A form is not involved, but `Enter` in a text field is a submit gesture everywhere else and
      // the modal's primary action is one keypress away.
      event.preventDefault();
      toggle(suggestions[0].id);
      onSearchChange("");
      return;
    }
    if (event.key === "Backspace" && search === "" && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  };

  return (
    /* `w-full`: `Group` lays its controls out in a flex row, and this one is a block that owns the
       row. Same arrangement as the resolved-expression field below it. */
    <div className="grid w-full gap-1.5">
      {/* The sunken field, sharing `ui/input`'s geometry and its focus ring — but the ring is on the
          box (`focus-within`) rather than on the input, because the box is what reads as the control
          and the tokens live inside it. `flex-wrap` so a long selection grows the field downwards
          instead of scrolling sideways. */}
      <div className="flex min-h-8.5 flex-wrap items-center gap-1.5 rounded-lg border border-gr-border bg-gr-sunk px-2 py-1.5 transition-[box-shadow,border-color] duration-150 inset-shadow-gr-sunk focus-within:border-gr-accent focus-within:ring-3 focus-within:ring-gr-ring">
        {tokens.map((category) => (
          <Token
            key={category.id}
            name={category.name}
            onRemove={() => toggle(category.id)}
          />
        ))}
        {/* No click-to-focus handler on the box: `flex-1 min-w-24` keeps a strip of the field that
            *is* the input at every selection size, so there is nothing left for a handler to fix — and
            a `<div onClick>` or a `<label>` wrapped around these buttons would each cost an a11y rule
            (see the note in `ds/Field`). */}
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={onKeyDown}
          aria-label={INDEX_TEXT.filters.categories.search}
          placeholder={tokens.length > 0 ? "" : INDEX_TEXT.filters.categories.placeholder}
          /* `min-w-24` keeps a clickable strip of field even when the tokens fill the row, so the
             control never becomes unfocusable by pointer. */
          className="min-w-24 flex-1 bg-transparent text-2xs text-gr-fg outline-none placeholder:text-gr-fg-4"
        />
      </div>

      {/* One list, two meanings. The caption says which — chips that silently change what they offer
          would be the worst of both.
          ⚠️ **On its own line, not inline with the chips.** Inline, the ten suggestions wrap under the
          caption and the second row starts at the container's left edge instead of under the first
          chip — a visible step that every other label in this modal avoids by sitting above its
          controls. It costs one 16px line. */}
      <Overline className="h-4 leading-4">
        {needle ? INDEX_TEXT.filters.categories.matches : INDEX_TEXT.filters.categories.mostUsed}
      </Overline>
      <div className="flex min-h-6 flex-wrap items-center gap-x-2.5 gap-y-1.5">
        {suggestions.map((category) => (
          <Segment
            key={category.id}
            on={selected.includes(category.id)}
            onClick={() => toggle(category.id)}
          >
            {category.name}
            {/* The count only makes sense on the ranked list: on a search result it would be answering
                a question nobody asked, and it is what makes the row twice as wide. */}
            {!needle && <span className="ml-1.5 opacity-60">{category.bookmarks_count}</span>}
          </Segment>
        ))}
        {needle && suggestions.length === 0 && (
          <Overline className="text-gr-fg-4">{INDEX_TEXT.filters.categories.noMatch}</Overline>
        )}
        {matches.length > suggestions.length && (
          <Overline className="shrink-0 text-gr-fg-4">
            {INDEX_TEXT.filters.categories.more(matches.length - suggestions.length)}
          </Overline>
        )}
      </div>
    </div>
  );
}

/* A selected category, inside the field. **One button, not a chip with a nested `×`** — a button
 * inside a button is invalid markup, and the whole token being the remove target is a bigger and more
 * obvious hit area than a 10px glyph. The `×` is `aria-hidden`; the accessible name says what the
 * click does.
 *
 * It wears `Segment`'s selected fill by hand rather than being a `Segment`: a segment is a toggle that
 * stays where it is, and this one deletes itself. */
function Token({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={INDEX_TEXT.filters.categories.remove(name)}
      className={cn(
        "inline-flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-2xs tracking-wider transition-colors duration-120 outline-none",
        "border-gr-teal-border bg-linear-to-b from-gr-teal-from to-gr-teal-to text-gr-teal-fg shadow-gr-1 inset-shadow-gr-hair",
        "hover:border-gr-oxide-border hover:from-gr-oxide-from hover:to-gr-oxide-to hover:text-gr-oxide-fg",
        "focus-visible:border-gr-accent focus-visible:ring-3 focus-visible:ring-gr-ring",
      )}
    >
      {name}
      <span
        aria-hidden
        className="opacity-70"
      >
        ×
      </span>
    </button>
  );
}

export { CategoryPicker };
