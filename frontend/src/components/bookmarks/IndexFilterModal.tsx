"use client";

import { CategoryPicker } from "@components/bookmarks/CategoryPicker";
import { clearFilters, describeQuery, toFilterHref } from "@components/bookmarks/helpers/indexQuery";
import { Field } from "@components/ds/Field";
import { Overline } from "@components/ds/Overline";
import { Segment } from "@components/ds/Segment";
import { MAX_STARS } from "@components/ds/Stars";
import useShellCounts from "@components/shared/shell/services/useShellCounts";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { cn } from "@lib/utils";
import { ALARM_STATES } from "@src/schemas/primitives";
import { useFilterCount } from "@src/services/useFilterCount";
import { INDEX_TEXT } from "@text/index";
import Link from "next/link";
import { useId, useState } from "react";

import type { Category } from "@src/schemas/categories";
import type { FiltersQuery } from "@src/schemas/filters";
import type { PriorityFilter } from "@src/schemas/primitives";

/** The priority segments in reading order: most urgent first, `—` last.
 *
 *  ⚠️ **Not `PRIORITY_FILTER_LEVELS` reversed**, which is what this was and it put the `—` in front of
 *  `highest`. That constant is ordered for *normalising a URL* — ascending, with `none` appended — and
 *  reversing it moves the one member that is not a level to the head of the row. The handoff reads
 *  `high · med · low · —`, so the absence of a level goes at the end, where an absence belongs. */
const PRIORITY_SEGMENTS: PriorityFilter[] = ["highest", "high", "medium", "low", "none"];

/** `1+ … 5`, the star minimums. `MAX_STARS` is the DS's own five — the same number the row's stars
 *  are drawn from, so the filter cannot offer a level the display has no bar for. */
const STAR_MINIMUMS = Array.from({ length: MAX_STARS }, (_, index) => index + 1);

/* `FilterModal_Graphite` — the filter modal (COS-300), and the screen's one piece of state that is
 * **not** in the URL.
 *
 * That is the whole design of this component. Everywhere else on the index a control is a `<Link>`
 * and a click is a navigation, because the query lives in the address bar. Here seven controls
 * describe *one* filter: choosing a category, then three stars, then `armed` would be three
 * navigations and three round trips to reach one list. So the modal edits a **draft**, counts it as
 * you go, and applies it in a single move — which is also what the handoff's footer says it does,
 * `filter — 27 results` being a button and not a status line.
 *
 * The draft still resolves to an address: the primary action is a `<Link>` to the filtered index, so
 * ⌘-click opens it in a tab and the back button undoes the whole filter in one step rather than
 * seven.
 *
 * ⚠️ **The draft is seeded when the modal opens, and only then.** Radix unmounts the content while
 * closed, so `useState(query)` in `FilterForm` re-initialises on every open — which is why the form
 * is a component of its own rather than a branch of this one. Without that split a draft edited,
 * abandoned, and reopened would come back instead of the query actually on screen.
 *
 * **Mutual exclusion with the edit modal** (the handoff's `openEdit` closing this one) is COS-319's
 * to wire: it owns the state that would close this, and there is nothing to exclude until it exists.
 * Radix will not let two dialogs share focus in the meantime. */
function IndexFilterModal({
  open,
  onOpenChange,
  query,
  pathname,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: FiltersQuery;
  pathname: string;
  categories: Category[];
}) {
  /* The category search box's text, held up here rather than in the picker that owns the box.
   *
   * ⚠️ **Only `esc` is the reason.** Pressing it to clear that field must not close the modal and take
   * the draft with it, and the one supported way to cancel a Radix dismissal is `onEscapeKeyDown` on
   * `DialogContent` — this component's prop. Radix's listener is on `document` in the **capture** phase,
   * so a `stopPropagation` inside the input runs too late; that was the first attempt and the modal
   * closed regardless. The state therefore lives where the handler is.
   *
   * It is cleared on close instead of on open: `FilterForm` is remounted on every open, so a fresh
   * field with a stale search string is the only failure mode, and clearing on the way out removes it. */
  const [search, setSearch] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSearch("");
        onOpenChange(next);
      }}
    >
      {/* The close glyph is in the header row, after the match count, as the handoff draws it —
          `DialogContent`'s own is absolutely positioned and would sit on top of that count.
          No `aria-describedby={undefined}`: that is shadcn's escape hatch for a modal with no
          description, and this one has `advanced · live`. Left alone, Radix wires the two together. */}
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => {
          if (search === "") return;
          event.preventDefault();
          setSearch("");
        }}
      >
        <FilterForm
          query={query}
          pathname={pathname}
          categories={categories}
          search={search}
          onSearchChange={setSearch}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function FilterForm({
  query,
  pathname,
  categories,
  search,
  onSearchChange,
  onClose,
}: {
  query: FiltersQuery;
  pathname: string;
  categories: Category[];
  /** The category search box's text — held above this component, for `esc`. See `IndexFilterModal`. */
  search: string;
  onSearchChange: (search: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<FiltersQuery>(query);
  const { total: matches, elapsedMs, isStale } = useFilterCount(draft, { enabled: true });
  const { bookmarks: indexTotal } = useShellCounts();

  const names = new Map(categories.map((category) => [category.id, category.name]));
  const expression = describeQuery(draft, names);
  const selectedCategories = draft.categories_id ?? [];
  const selectedPriorities = draft.priority ?? [];

  /** Every control writes through this: a patch onto the draft, never a whole new object, so a field
   *  added later cannot be silently dropped by one of the seven handlers. */
  const patch = (fields: Partial<FiltersQuery>) => setDraft((current) => ({ ...current, ...fields }));

  /** Adds or removes one member of a multi-select — the categories, the priority levels. An empty
   *  selection comes back as `undefined` and not as `[]`, because the filter object's absent state is
   *  the absent key: an empty array would put `priority=` in the URL and count as a filter. */
  const toggleList = <T,>(list: readonly T[], value: T): T[] | undefined => {
    const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
    return next.length > 0 ? next : undefined;
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{INDEX_TEXT.filters.title}</DialogTitle>
        <DialogDescription>{INDEX_TEXT.filters.mode}</DialogDescription>
        {/* `27/1278 match`. The denominator is the index's real total, read from the chrome's own
            counter — it is already in the cache on every private screen, so naming it here costs no
            request. `tabular-nums` because this number changes while the modal is open and the
            proportional digits of the mono face still differ in width for `1`. */}
        <span className="ml-auto shrink-0 text-2xs tabular-nums text-gr-fg-3">
          {matches ?? "—"}
          {indexTotal != null && <span className="text-gr-fg-4">/{indexTotal}</span>}{" "}
          <Overline>{INDEX_TEXT.filters.match}</Overline>
        </span>
        <DialogClose
          aria-label={INDEX_TEXT.filters.close}
          className="shrink-0 rounded-md text-base leading-none text-gr-fg-3 transition-colors duration-120 outline-none hover:text-gr-fg focus-visible:ring-3 focus-visible:ring-gr-ring"
        >
          <span aria-hidden>×</span>
        </DialogClose>
      </DialogHeader>

      <DialogBody>
        <Field
          label={INDEX_TEXT.filters.fields.title}
          placeholder={INDEX_TEXT.filters.fields.titlePlaceholder}
          value={draft.title ?? ""}
          onChange={(event) => patch({ title: event.target.value || undefined })}
          autoFocus
        />

        {/* ⚠️ **A picker, not a cloud** (owner's call, mid-ticket). This drew all fifty-three
            categories as chips first — seven rows, capped and scrolled — and it was right that nobody
            reads fifty-three pills to find `dev`. `CategoryPicker` is a token field plus one row of
            suggestions; the reasoning lives in that file.
            It owns the whole `categories_id` field rather than toggling one id, because a token field
            removes as readily as it adds. */}
        <Group label={INDEX_TEXT.filters.fields.categories}>
          <CategoryPicker
            categories={categories}
            selected={selectedCategories}
            onChange={(next) => patch({ categories_id: next.length > 0 ? next : undefined })}
            search={search}
            onSearchChange={onSearchChange}
          />
        </Group>

        {/* Two pairs of groups, side by side while they fit and stacked when they do not.
            ⚠️ **`flex-wrap`, and no width query of any kind.** This modal is portalled out of the app
            screen, so `@max-3xl:` cannot fire inside it (§7), and making the modal its own container
            would make that query *permanently true* — 640px is always under 768. Wrapping needs
            neither: it is already conditional on the content not fitting, which is the question a
            threshold would have been approximating.
            **`min-w-72` is measured, not chosen**: 288px, the next step above the 272 the widest of
            these rows (`stars`, six segments at the handoff's 6px gap) needs to stay on one line. That
            makes the layout binary — either both halves are at least 288 wide and neither wraps
            internally, or they stack and each gets the modal's full width. The in-between where a
            column is wide enough to sit beside its neighbour but too narrow for its own contents is
            the state that printed a lone `5` under the star row, and this number is what removes it. */}
        <div className="flex flex-wrap gap-4">
          <Group
            label={INDEX_TEXT.filters.fields.stars}
            className="min-w-72 flex-1"
          >
            <Segment
              on={draft.stars == null}
              onClick={() => patch({ stars: undefined })}
            >
              {INDEX_TEXT.filters.starLevels.any}
            </Segment>
            {STAR_MINIMUMS.map((stars) => (
              <Segment
                key={stars}
                on={draft.stars === stars}
                onClick={() => patch({ stars: draft.stars === stars ? undefined : stars })}
              >
                {INDEX_TEXT.filters.starLevels.min(stars)}
              </Segment>
            ))}
          </Group>

          <Group
            label={INDEX_TEXT.filters.fields.priority}
            className="min-w-72 flex-1"
          >
            {PRIORITY_SEGMENTS.map((level) => (
              <Segment
                key={level}
                on={selectedPriorities.includes(level)}
                onClick={() => patch({ priority: toggleList<PriorityFilter>(selectedPriorities, level) })}
              >
                {INDEX_TEXT.filters.priorityLevels[level] ?? level}
              </Segment>
            ))}
          </Group>
        </div>

        <div className="flex flex-wrap gap-4">
          <Group
            label={INDEX_TEXT.filters.fields.reminder}
            className="min-w-72 flex-1"
          >
            <Segment
              on={draft.alarm == null}
              onClick={() => patch({ alarm: undefined })}
            >
              {INDEX_TEXT.filters.reminderStates.any}
            </Segment>
            {ALARM_STATES.map((state) => (
              <Segment
                key={state}
                on={draft.alarm === state}
                onClick={() => patch({ alarm: draft.alarm === state ? undefined : state })}
              >
                {INDEX_TEXT.filters.reminderStates[state]}
              </Segment>
            ))}
          </Group>

          <Group
            label={INDEX_TEXT.filters.fields.contains}
            className="min-w-72 flex-1"
            /* 14px here and 6px everywhere else, both the handoff's: a pill carries its own edge, so
               6px reads as a separation; three bare `[x] label` pairs at 6px read as one string. */
            controlsClassName="gap-x-3.5"
          >
            {/* Three explicit lines rather than a list mapped over the field names: a computed key
                on a `Partial<FiltersQuery>` loses its type, and three flags do not need a loop. */}
            <CheckLine
              label={INDEX_TEXT.filters.contains.screenshot}
              on={Boolean(draft.screenshot)}
              onClick={() => patch({ screenshot: !draft.screenshot || undefined })}
            />
            <CheckLine
              label={INDEX_TEXT.filters.contains.notes}
              on={Boolean(draft.notes)}
              onClick={() => patch({ notes: !draft.notes || undefined })}
            />
            <CheckLine
              label={INDEX_TEXT.filters.contains.url}
              on={Boolean(draft.url)}
              onClick={() => patch({ url: !draft.url || undefined })}
            />
          </Group>
        </div>

        {/* The command bar's own field, read-only and without its caret: the same shorthand in the
            same sunken box, so the line the modal writes and the line the index shows are visibly
            one thing. `describeQuery` prints the draft — it updates as the segments are clicked,
            before anything is applied. */}
        <Group label={INDEX_TEXT.filters.fields.expression}>
          <output className="flex min-h-6.5 w-full min-w-0 items-center gap-1.5 rounded-md border border-gr-border bg-gr-sunk px-2 py-1 text-2xs text-gr-fg-2 inset-shadow-gr-sunk">
            <span
              aria-hidden
              className="shrink-0 text-gr-fg-4"
            >
              &gt;
            </span>
            {/* Wraps rather than truncating, unlike the command bar's copy: there is room here, and
                the point of this line is to be read in full. */}
            <span className="min-w-0 break-all">{expression || INDEX_TEXT.command.unfiltered}</span>
          </output>
        </Group>
      </DialogBody>

      {/* Sticky, so the primary action stays where it is when a short viewport makes the modal
          scroll. The whole panel is the scroll container — see `DialogContent`. */}
      <DialogFooter className="sticky bottom-0">
        <Button
          asChild
          variant="primary"
          size="chrome"
        >
          {/* A link, like every other control that changes the query: ⌘-click opens the filtered
              index in a tab, and the back button undoes all seven filters in one step. */}
          <Link
            href={toFilterHref(pathname, draft)}
            onClick={onClose}
          >
            {matches != null && !isStale
              ? INDEX_TEXT.filters.footer.apply(matches)
              : INDEX_TEXT.filters.footer.applyPending}
          </Link>
        </Button>
        <Button
          asChild
          variant="chrome"
          size="chrome"
        >
          <Link
            href={toFilterHref(pathname, clearFilters(query))}
            onClick={onClose}
          >
            {INDEX_TEXT.filters.footer.reset}
          </Link>
        </Button>
        {/* ⚠️ Measured, not the handoff's static `4 ms` — and absent until there is something to
            report, rather than printing a `0`. */}
        <Overline className="ml-auto shrink-0 tabular-nums">
          {elapsedMs != null && INDEX_TEXT.filters.footer.live(elapsedMs)}
        </Overline>
      </DialogFooter>
    </>
  );
}

/* A labelled group of controls, laid out exactly like `Field`'s header + control pair so that a
 * `Field` and a `Group` beside each other put their labels *and* their contents on the same two
 * lines — `h-4 leading-4` for the same reason it is load-bearing there.
 *
 * `role="group"` with the label as its accessible name, because a row of toggles is a group and not a
 * fieldset of inputs: `<legend>` would be the right element for radio buttons, and these are
 * `aria-pressed` buttons. */
function Group({
  label,
  className,
  controlsClassName,
  children,
}: {
  label: string;
  className?: string;
  /** The row of controls, for the one group whose spacing is not the segments' — see `contains`. */
  controlsClassName?: string;
  children: React.ReactNode;
}) {
  const labelId = useId();

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Overline
        id={labelId}
        className="flex h-4 items-center leading-4"
      >
        {label}
      </Overline>
      {/* ⚠️ **6px, which is the handoff's gap for a row of segments** — this was `gap-x-3.5` (14px,
          the figure the *checkboxes* use) and the 8px difference was enough to make two of the rows
          wrap: `stars` needs 272px on one line and had 291 to spend, but at 14px it wanted 312. The
          right gap is both the faithful one and the one that fits. */}
      <div
        role="group"
        aria-labelledby={labelId}
        className={cn("flex flex-wrap items-center gap-1.5", controlsClassName)}
      >
        {children}
      </div>
    </div>
  );
}

/* The handoff's `[x] screenshot` — a checkbox drawn in text, the same figure the rail's scopes use.
 *
 * A real `<button aria-pressed>` rather than `ui/checkbox`: the brackets *are* the control, so a box
 * beside them would be two checkboxes for one filter, and the toggle-button pattern announces the
 * state without needing the glyph to be read. The brackets are `aria-hidden` for that reason. */
function CheckLine({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md text-2xs transition-colors duration-120 outline-none",
        "focus-visible:ring-3 focus-visible:ring-gr-ring",
        on ? "text-gr-fg" : "text-gr-fg-3 hover:text-gr-fg",
      )}
    >
      <span
        aria-hidden
        className={on ? "text-gr-accent" : "text-gr-fg-4"}
      >
        [{on ? "x" : " "}]
      </span>
      {label}
    </button>
  );
}

export { IndexFilterModal };
