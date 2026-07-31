"use client";

import { FieldGroup } from "@components/ds/FieldGroup";
import { Overline } from "@components/ds/Overline";
import { Segment } from "@components/ds/Segment";
import { cn } from "@lib/utils";
import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { CREATE_TEXT } from "@text/create";
import { useState } from "react";

import type { Category, CategoryOption } from "@src/schemas/categories";

/** How many tags the row under the field ever offers — the ten most used, or the ten best matches.
 *  The filter modal's figure, for the same reason: ten is one row at every width this field has. */
const MAX_SUGGESTIONS = 10;

/* `tags` — the record's categories, selected or written (COS-302).
 *
 * ⚠️ **A near-twin of `bookmarks/CategoryPicker`, and separate from it on purpose.** That one filters
 * and this one writes, which is not a difference of styling:
 *
 * - it carries `number[]`, ids of categories that exist; this carries `CategoryOption[]`, where a tag
 *   with no `id` is one the backend will **create** (`postBookmarkController` inserts it and gives it
 *   a colour). A picker that can only return ids cannot express that.
 * - it has a fixed set to choose from; this one grows it, so it needs the dashed `+ tag` affordance
 *   and a bound on the name — `category.name` is `VARCHAR(20)`, and the 21st character used to come
 *   back from MySQL as a raw error.
 *
 * What they share is the arrangement, which is the owner's call from COS-300 and the reason neither
 * is a cloud of chips: **a token field you type into, and one row of suggestions under it**. With
 * fifty-three categories on the live index, a cloud is seven rows nobody reads.
 *
 * No floating listbox and no `role="combobox"`, again as there: with no listbox to own, the role
 * would describe a widget that is not on screen. It is a labelled text field followed by buttons. */
function TagsField({
  value,
  categories,
  onChange,
}: {
  value: CategoryOption[];
  categories: Category[];
  onChange: (next: CategoryOption[]) => void;
}) {
  const [search, setSearch] = useState("");

  const needle = search.trim();
  const folded = needle.toLowerCase();
  const chosen = new Set(value.map((option) => option.label.toLowerCase()));

  /* Already-chosen tags are dropped from the suggestions rather than shown selected, which is the
   * other half of the difference with the filter modal: there a lit segment is how you *un*-select,
   * here the token in the field is, and offering both would be two controls for one action. */
  const available = categories.filter((category) => !chosen.has(category.name.toLowerCase()));
  const matches = folded
    ? available.filter((category) => category.name.toLowerCase().includes(folded))
    : /* `toSorted`, not `sort`: `categories` is the react-query cache's array and sorting it in place
         would reorder the index rail too. Ties break on the name so the row is stable. */
      available.toSorted((a, b) => b.bookmarks_count - a.bookmarks_count || a.name.localeCompare(b.name));
  const suggestions = matches.slice(0, MAX_SUGGESTIONS);

  /** A typed name is offered for creation only when nothing already carries it — including a
   *  category the user has *not* selected, since picking the existing one is always better than
   *  making a duplicate the backend would happily insert beside it. */
  const isNew = folded !== "" && !categories.some((category) => category.name.toLowerCase() === folded);

  const add = (option: CategoryOption) => {
    onChange([...value, option]);
    setSearch("");
  };

  const remove = (label: string) => onChange(value.filter((option) => option.label !== label));

  /* `↵` takes the first suggestion, or creates what was typed when there is none — the two things
   * this field can do, in the order the row shows them. `⌫` on an empty field removes the last
   * token, which is what a token field is expected to do. */
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // No form submit from here: the screen commits on ⌘↵, and a bare Enter in this field means
      // "add the tag", never "save the record".
      event.preventDefault();
      if (suggestions.length > 0) {
        add({ label: suggestions[0].name, id: suggestions[0].id, value: suggestions[0].id });
      } else if (isNew) {
        add({ label: needle });
      }
      return;
    }
    if (event.key === "Backspace" && search === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <FieldGroup
      label={CREATE_TEXT.sections.tags}
      hint={
        needle.length >= FIELD_LIMITS.categoryName - 4 ? CREATE_TEXT.tags.limit(FIELD_LIMITS.categoryName) : undefined
      }
    >
      {/* The sunken field, sharing `ui/input`'s geometry and its focus ring — but the ring is on the
          box (`focus-within`) rather than on the input, because the box is what reads as the control
          and the tokens live inside it. */}
      <div className="flex min-h-8.5 w-full flex-wrap items-center gap-1.5 rounded-lg border border-gr-border bg-gr-sunk px-2 py-1.5 transition-[box-shadow,border-color] duration-150 inset-shadow-gr-sunk focus-within:border-gr-accent focus-within:ring-3 focus-within:ring-gr-ring">
        {value.map((option) => (
          <Token
            key={option.label}
            name={option.label}
            isNew={option.id == null}
            onRemove={() => remove(option.label)}
          />
        ))}
        <input
          type="text"
          value={search}
          maxLength={FIELD_LIMITS.categoryName}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={onKeyDown}
          aria-label={CREATE_TEXT.tags.search}
          placeholder={value.length > 0 ? "" : CREATE_TEXT.tags.placeholder}
          /* `min-w-24` keeps a clickable strip of field even when the tokens fill the row, so the
             control never becomes unfocusable by pointer — which is also why there is no
             click-to-focus handler on the box around it. */
          className="min-w-24 flex-1 bg-transparent text-2xs text-gr-fg outline-none placeholder:text-gr-fg-4"
        />
      </div>

      {/* One row, two meanings; the caption says which. On its own line rather than inline with the
          segments, so a second row of them starts under the first and not at the container's edge. */}
      <Overline className="h-4 w-full leading-4">
        {folded ? CREATE_TEXT.tags.matches : CREATE_TEXT.tags.mostUsed}
      </Overline>
      <div className="flex min-h-6 w-full flex-wrap items-center gap-x-2.5 gap-y-1.5">
        {/* ⚠️ **`action` on every segment of this row, and it is not a detail.** `ds/Segment` is a
            toggle and announces itself as one; here a segment *adds a tag and disappears*, so
            "toggle button, not pressed" would describe a state it never reaches. The tokens in the
            field above are how a tag comes back off.

            The creation offer comes first: it is what you were typing, and it is the row's answer
            when nothing matched. Dashed, like `ds/Chip`'s add affordance — a slot, not a value. */}
        {isNew && (
          <Segment
            action
            aria-label={CREATE_TEXT.tags.createAria(needle)}
            onClick={() => add({ label: needle })}
            className="border-dashed"
          >
            {CREATE_TEXT.tags.create(needle)}
          </Segment>
        )}
        {suggestions.map((category) => (
          <Segment
            key={category.id}
            action
            onClick={() => add({ label: category.name, id: category.id, value: category.id })}
          >
            {category.name}
            {/* The count only makes sense on the ranked list: on a search result it would answer a
                question nobody asked, and it is what makes the row twice as wide. */}
            {!folded && <span className="ml-1.5 opacity-60">{category.bookmarks_count}</span>}
          </Segment>
        ))}
        {folded && !isNew && suggestions.length === 0 && (
          <Overline className="text-gr-fg-4">{CREATE_TEXT.tags.noMatch}</Overline>
        )}
        {matches.length > suggestions.length && (
          <Overline className="shrink-0 text-gr-fg-4">
            {CREATE_TEXT.tags.more(matches.length - suggestions.length)}
          </Overline>
        )}
      </div>
    </FieldGroup>
  );
}

/* A selected tag, inside the field. **One button, not a chip with a nested `×`** — a button inside a
 * button is invalid markup, and the whole token being the remove target is a bigger and more obvious
 * hit area than a 10px glyph.
 *
 * A tag that does not exist yet wears the dashed border it was created with, so the field keeps
 * saying which of these the commit is about to bring into being. */
function Token({ name, isNew, onRemove }: { name: string; isNew: boolean; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={CREATE_TEXT.tags.remove(name)}
      className={cn(
        "inline-flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-2xs tracking-wider transition-colors duration-120 outline-none",
        "border-gr-teal-border bg-linear-to-b from-gr-teal-from to-gr-teal-to text-gr-teal-fg shadow-gr-1 inset-shadow-gr-hair",
        "hover:border-gr-oxide-border hover:from-gr-oxide-from hover:to-gr-oxide-to hover:text-gr-oxide-fg",
        "focus-visible:border-gr-accent focus-visible:ring-3 focus-visible:ring-gr-ring",
        isNew && "border-dashed",
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

export { TagsField };
