# bkmk — the GRAPHITE design system

The vocabulary the interface is written in: colour, type, radius, elevation, spacing. Read this
before adding UI — most visual decisions are already made, and the point of a system is that you
spend your decisions on the product rather than on picking a grey.

Built with Tailwind v4, CSS-first: no `tailwind.config.js`, the theme lives in CSS via `@theme`.
Established by **COS-290 (DS 01)**, modelled on `~/dev/pfa/front/docs/design-system.md`.

Every value below was read out of the code, not remembered. If a number here disagrees with the
CSS, **the CSS wins** — fix the document.

---

## 1. Ground rules

These are decisions, not preferences. They were argued once so they don't have to be argued on
every screen.

**Use a token, never a raw value.** No `text-[12.5px]`, no `rounded-[7px]`, no `p-[14px]`, no
`bg-[#a3a4a0]`. Every one of those has a canonical equivalent below.

**No stock Tailwind palette.** Not `gray-400`, not `emerald-700`. GRAPHITE's colours are chosen
hues; Tailwind's greys don't come close and would clash beside them.

**Never name a utility you are not using — not even in a comment.** Tailwind scans source files for
class-name candidates and cannot tell code from prose, so a comment explaining "this used to be
`X`" emits `X`. DS 01 met this through the docs and closed it with `@source not "../docs"`; that
does not cover `src/`. COS-292 met it again while explaining a class it had just removed, and left a
dead rule in the bundle until the comment was reworded. Describe the utility instead: *54px tall*,
not the class that produces it.

**Snap before creating a token.** If the native Tailwind scale has an equivalent step, take the
native step. Add a token only where the native scale genuinely has nothing. That is why this system
has **no** radius token at all and only **two** text-size tokens.

**Spacing stays on the numbered scale**, half-steps included: `p-3.5` (14px), `py-4.5` (18px),
`px-5.5` (22px). The whole handoff already lands there. **No named spacing tokens** — no
`--p-modal`; repeated spacing gets centralised in the component that owns it.

**No `dark:` variant.** GRAPHITE is a single light-grey theme.

**A clickable thing shows a pointer.** Tailwind v4 changed the default cursor on `<button>` from
`pointer` to `default`, which quietly gave every control in the app an arrow — chrome and primary
buttons, the pager, `Segment`, `TabBar`, `RowAction`, the reveal toggle, the radix checkbox and select
triggers are all `<button>`. `base.css` restores it once for `button` and `[role="button"]`, excluding
`:disabled` and `aria-disabled`, rather than each component carrying a class: there is no component
this should not be true of, and the next one written gets it for free. It sits in `@layer base`, so a
`cursor-*` utility still wins where a screen needs something else.

**Path aliases only**, never `./` or `../`, not even within a module.

---

## 2. Colour

`styles/tokens/colors.css`. Authority: `design_handoff_graphite/README.md`.

| Token | Value | Usage |
|---|---|---|
| `gr-bg` | `#a3a4a0` | screen background — flat, no texture |
| `gr-bg-2` | `#b3b4af` | secondary light surfaces |
| `gr-bg-3` | `#9b9c97` | sunken surfaces |
| `gr-panel` | `#adaea9` | card background |
| `gr-panel-2` | `#b4b5b0` | top chrome, command bar, card footers |
| `gr-sunk` | `#9a9b96` | fields, code blocks, drop zone, image slots |
| `gr-fg` | `#161715` | body text |
| `gr-fg-2` | `#0c0d0c` | strong text — titles, values |
| `gr-fg-3` | `#474944` | secondary text, micro-labels |
| `gr-fg-4` | `#6a6c66` | tertiary text — counters, timestamps |
| `gr-accent` | `#1d5b4f` | muted teal — LED, caret, primary action, selected row |
| `gr-accent-2` | `#7d3714` | oxide — stars, imminent alarm |
| `gr-danger` | `#8a3512` | errors |
| `gr-border` | `rgb(22 23 21 / 0.16)` | inner rules |
| `gr-border-2` | `rgb(22 23 21 / 0.32)` | structural rules, button borders |
| `gr-hair` | `rgb(255 255 255 / 0.45)` | 1px light edge along the top of surfaces |
| `gr-ring` | `rgb(29 91 79 / 0.26)` | focus ring, 3px |
| `gr-selection` | `rgb(29 91 79 / 0.20)` | text selection |

| `gr-scrim` | `rgb(28 30 27 / 0.4)` | modal backdrop, blurred 3px |

Two fills come as sets of four, because a gradient needs both stops, a border and a foreground.
**Affirmative** — primary button, selected segment: `gr-teal-from` `#256b5c`, `gr-teal-to`
`#1b5449`, `gr-teal-border` `#174740`, `gr-teal-fg` `#e9efeb`. **Destructive** — the delete flow:
`gr-oxide-from` `#8d4018`, `gr-oxide-to` `#763512`, `gr-oxide-border` `#5f2a0e`, `gr-oxide-fg`
`#f4ece6`.

---

## 3. Type

`styles/tokens/typography.css`. One family, **IBM Plex Mono**, loaded through `next/font`.

The handoff offers nine steps, **six of them between 9.5 and 12.5px**. Six steps spread over 3px
are not six decisions, they are mockup noise. After normalising and then snapping, **two tokens**
remain:

| Token | Value | Usage |
|---|---|---|
| `text-3xs` | 10px | every uppercase chrome label: micro-labels, column headers, buttons, mini-buttons, tabs, status bar, slots |
| `text-2xs` | 11px | small sentence-case text: chips, segments, search field, secondary url, timestamps |

### Where each handoff value went

| Handoff | Decision | Result |
|---|---|---|
| 9 (status bar, narrow) | → 10 | `text-3xs` |
| 9.5 (micro-label, column header, mini-button) | → 10 | `text-3xs` |
| 10 (chip, slot, status bar) | keep | `text-3xs` |
| 10.5 (button) | → 10 | `text-3xs` |
| 11 (tab, segment, sub-line, timestamp) | keep | `text-2xs` |
| 11.5 (search, rail row) | → 11 | `text-2xs` |
| 12 (table row, key/value) | native | `text-xs` |
| 12.5 (base) | → 12 | `text-xs` |
| 13 (BKMK wordmark) | → 12 | `text-xs` |
| 14 | native | `text-sm` |
| 15 (tab-bar glyph) | → 14 | `text-sm` |
| 21 (record title) | → 20 | `text-xl` |
| 24 (About title) | native | `text-2xl` |
| 26 (auth title) | → 24 | `text-2xl` |

**The two judgement calls that change something.** The handoff separates the micro-label (9.5) from
the button (10.5) by one pixel: at that size colour and letter-spacing carry the hierarchy, not
1px, so the two meet at 10. And the three titles (21 / 24 / 26) land on two native steps, which
puts the record and auth titles on their nearest neighbour without creating a single token.

The same argument settles the 9px the handoff drops the status bar to on narrow widths (COS-292):
it is one pixel below the smallest label in the system, and the shrink would be paid for with a
token nothing else would ever use. The status bar stays `text-3xs` at both widths.

### Letter-spacing

| Token | Value | Usage |
|---|---|---|
| `tracking-caps` | `0.14em` | wide uppercase — micro-labels, column headers, slots, wordmark |
| `tracking-snug` | `-0.015em` | titles |

Control uppercase (the handoff's 0.08 / 0.10em) takes native **`tracking-widest`**, which is 0.1em.
The tab bar's 0.12em sits halfway between that and `tracking-caps`; it is the same kind of control
label as the chrome tabs, so it joins them on `tracking-widest`. Chips and segments (0.04em) take
**`tracking-wider`**, 0.05em. The base's -0.005em is dropped: 0.06px on 12px text, invisible.

`.num` applies `font-variant-numeric: tabular-nums` — the table is dense with dates, counters and
stars.

---

## 4. Radius

`styles/tokens/radius.css`. **No token at all**: all eight of the handoff's radii land on the native
scale (`md` 6 · `lg` 8 · `xl` 12 · `2xl` 16 · `full`).

| Handoff | Decision | Result |
|---|---|---|
| chip 6 | native | `rounded-md` |
| tab 7 | → 6 | `rounded-md` |
| tab-bar button 11 | → 12 | `rounded-xl` |
| segment 8 | native | `rounded-lg` |
| field & button 9 | → 8 | `rounded-lg` |
| slot & drop zone 10 | → 8 | `rounded-lg` |
| card 12 | native | `rounded-xl` |
| modal 14 | → 16 | `rounded-2xl` |
| gauge & LED 999 | native | `rounded-full` |

**The two judgement calls**, since no native step exists at 10 or at 14. The **slot goes down to
8**: it nests inside a card at 12, and an inner radius equal to its container's makes the curve
spill. The **modal goes up to 16**: at 12 it would carry exactly a card's radius and lose its cue of
being a surface laid over everything else.

> ⚠️ **One scale only.** pfa ended up with two sets of radii sharing names but not values (`--r-lg`
> = 14px on the CSS side, `rounded-lg` = 10px on the utility side), which it lists among its known
> rough edges. Here `rounded-*` in TSX and `var(--radius-*)` in the partials mean the same thing.

---

## 5. Elevation

`styles/tokens/elevation.css`. Each token is a complete `box-shadow` value, usable as `shadow-gr-*`
or as `var(--shadow-gr-*)`.

| Token | Usage |
|---|---|
| `shadow-gr-1` | cards and buttons at rest |
| `shadow-gr-2` | button hover, auth card |
| `shadow-gr-chrome` | the top chrome strip — one tight drop, where a card's would band the desk |
| `shadow-gr-modal` | the modal — carries its own hair line |
| `shadow-gr-primary` | primary action, with the teal glow |
| `shadow-gr-oxide` | destructive action — the same shape in oxide |

**The system's signature: every light surface carries `inset 0 1px 0 var(--color-gr-hair)`.**

Tailwind v4 keeps `inset-shadow-*` on its own layer, so it composes with `shadow-*` instead of
replacing it. That is the whole answer, and it is why there is no hand-written class:

```
shadow-gr-1 inset-shadow-gr-hair    →  the card at rest, plus its light top edge
hover:shadow-gr-2                   →  only the outer half grows; the hair line stays put
```

| Token | Usage |
|---|---|
| `inset-shadow-gr-hair` | the 1px light edge — cards, command bars, buttons, the selected row |
| `inset-shadow-gr-sunk` | sunken surfaces — fields, code blocks, drop zone, image slots, the meter |
| `inset-shadow-gr-mark` | the selected row's 3px teal left edge |

`shadow-gr-modal` and `shadow-gr-primary` already contain their own hair line, so they never take
`inset-shadow-gr-hair` as well.

---

## 6. Spacing and heights

No tokens: everything lands on the numbered scale, **half-steps included and quarter-steps not**.

Half-steps earn their place — a 38px chrome strip and a 30px button are real decisions, and `h-9.5`
/ `h-7.5` say them exactly. Quarter-steps do not: an 11px padding beside a 12px one is not a
decision, it is the mockup's rounding surviving into the code. Tailwind v4 computes any multiple of
`--spacing`, so nothing stops you writing `px-2.75` — which is why the rule has to be written down
rather than enforced by the tool.

⚠️ **The rule had drifted, and COS-298 swept it.** Twenty quarter-steps had accumulated across DS
01–03 — this table itself listed one of them — each rounded to the nearest half-step:

| Was | Now | Where |
|---|---|---|
| `px-2.75` (11) | `px-3` (12) | `ui/input`, `ui/textarea`, `Segment`, `TopChrome` |
| `gap-1.75` (7) | `gap-2` (8) | `ui/button` ×2, `TopChrome` ×2 |
| `px-3.25` (13) | `px-3.5` (14) | `ui/button`, size `chrome` |
| `gap-1.25` (5) | `gap-1.5` (6) | `Field`, `Chip` |
| `gap-0.75` (3) | `gap-1` (4) | `TabBar`, both auth screens |
| `gap-2.25` · `py-2.25` (9) | `gap-2` · `py-2` (8) | `DropZone`, `CommandBar` |
| `py-1.75` · `px-1.75` (7) | `py-2` · `px-2` (8) | `KeyValueTable`, `Chip` |
| `size-1.25` (5) · `size-1.75` (7) | `size-1.5` (6) · `size-2` (8) | `Chip` dot, `Led` |

Nothing moves by more than a pixel, and no surface has two spacings a pixel apart any more.

| Handoff | Class |
|---|---|
| desk padding 14 | `p-3.5` |
| gap between cards 12 | `gap-3` |
| top chrome 38 / gap 18 | `h-9.5` / `gap-4.5` |
| command bar 46 | `min-h-11.5` |
| column header 28 | `h-7` |
| table row 30 | `h-7.5` |
| button 30 · segment 24 · chip 18 | `h-7.5` · `h-6` · `h-4.5` |
| action 22 · mini-button 20 | `h-5.5` · `h-5` |
| status bar 26 | `h-6.5` |
| tab-bar button 48 / gap 6 | `h-12` / `gap-1.5` |
| field padding 8/11 → 8/12 | `py-2 px-3` |

### The auth card's rhythm

One card, four spacings, all on the scale — the sign-in and sign-up screens are built from nothing
else:

| What | Class |
|---|---|
| card padding 22 | `p-5.5` |
| between rows of the card | `gap-3.5` (14) |
| label → input | `gap-1.5` (6) |
| the two-column key pair | `gap-3` (12) |
| block width — sign-in 480 · sign-up 576 | `w-120` · `w-144` |

Sign-up is the wider of the two because it carries four secret fields to sign-in's one: at 480 the
key pair had no room left for a validation message beside `confirm key`, so the label wrapped and
took its input down with it. 576 is `36rem`, the `xl` step, not "480 plus about a hundred".

**Validation messages cost no height at all.** They render at the right end of the field's label
row, replacing the hint while they show — not under the control, where they would either grow the
card as you tab through it or need a reserved line at every field, about 22px each. Both were built
during COS-298 and both were wrong: this is a condensed design, and dead air reads as a bug. The
constraint that buys it is that messages must be two or three words, which is enforced where they
are written, in `schemas/auth.ts`.

The server's refusal takes the same approach one row down: the right end of the action row, the
spot the handoff filled with an aside.

---

## 7. Responsive

`styles/tokens/breakpoints.css`. **No token** — and a single switching point.

The handoff puts `container-type: inline-size` on the screen and one query,
`@container (max-width: 720px)`. 720 sits exactly between `--container-2xl` (672) and
`--container-3xl` (768); we take **768, that is `@max-3xl`**, native.

The choice is decided on the iPad in portrait, exactly 768px: at 672 it would keep the dense table
on a width that cannot hold it, at 768 it gets the folded layout. For a dense index, that is the
right side.

Components write `@max-3xl:` and nothing else — no `md:`, no `@media`. Container queries follow the
width of the app screen, not the window.

### Where that rule stops: portalled surfaces

The rule holds for anything rendered **inside** the app screen, which declares the system's only
`container-type` (§9). A container query needs such an ancestor; with none, it does not fall back to
the viewport, it evaluates false at every width. So `@max-3xl:` on anything Radix portals to
`document.body` — a dialog, an alert dialog, a toast — is not a fold, it is a no-op.

That is not a rule to work around by reaching for `@media`, and not one to satisfy by making the
portalled element its own container either: a modal capped at 680px is *always* under 768px, so a
self-container would make `@max-3xl` permanently true, which is worse than never. Either the fold
belongs to the composed component, or it needs a threshold on the modal's own scale — a decision that
needs a real layout, so it belonged to the ticket that built one.

**COS-300 built one, and the answer was neither.** The filter modal folds two pairs of side-by-side
groups into one column, and it does it with `flex-wrap` and a `min-w-*` on each half — no container,
no threshold, no query. Wrapping is *already* conditional on the content not fitting, which is the
question a threshold approximates; the only number it needs is the width one half must have, and that
is measurable. Same argument `DialogFooter` won on. So the standing answer for a portalled surface is:
**reach for wrapping first, and only ask for a threshold when the fold changes more than the axis.**

Two live consequences, both deliberate:

- **`ui/dialog` has no width variants.** COS-291 gave its header and footer a copy of `CommandBar`'s
  fold; COS-292 found it inert and removed it. The footer kept the behaviour it was reaching for by
  wrapping unconditionally, which needs no threshold at all. The header's is deferred — see the
  comment in the file for why its 46 → 54px growth had no reason here to begin with.
- **`size="chrome"` on a button still carries `@max-3xl:h-8.5`**, and that one stays: buttons live on
  screens, where it works. Inside a modal it silently does not apply, and the ticket that composes
  the modal inherits that too.

---

## 8. The primitives

Established by **COS-291 (DS 02)**. Two directories, and which one a component lands in is decided
by one question: **does shadcn already provide it?**

- **`components/ui/`** — shadcn components restyled onto these tokens. Regenerable: the styling
  rides in `className` and cva entries, never in a changed signature, so re-running `shadcn add`
  stays a merge you can accept.
- **`components/ds/`** — what GRAPHITE has and no registry ships.

| `ds/` | Handoff | Notes |
|---|---|---|
| `Card` | `.gr-card` | the panel everything sits on |
| `CommandBar` · `PagerBar` | `.gr-cmd` · `.gr-pager` | the strips at a card's top and bottom |
| `Field` | — | composite: `Overline` bound to a `ui/input` |
| `Segment` | `.gr-seg` | a toggle, not a tab — see below |
| `Chip` | `.gr-chip` | the dot's hue comes from the data |
| `Overline` | `.gr-lab` | the most-used label in the system — `asChild` when it is a link; see below |
| `Stars` | `GStars` | `role="img"`, reads "3 out of 5" |
| `PriorityBars` | `GPri` | **four levels**, not the handoff's three |
| `Led` | `.gr-led` | decorative, `aria-hidden` |
| `KeyValueTable` | `.gr-kv` | a real `<dl>` |
| `DropZone` · `ShotSlot` | `.gr-drop` · `.gr-slot` | sunken dashed, two sizes |
| `BlinkCursor` | `.gr-caret` | `animate-gr-caret` — an **underscore**, drawn; see below |
| `RowActions` · `RowAction` | `.gr-acts` · `.gr-act` | needs `group/row` on the row |
| `MiniButton` | `.gr-mini` | preset over `ui/button` |

| `ui/`, restyled | Handoff |
|---|---|
| `button` | `.gr-btn`, `.pri`, `.danger`, `.danger.solid`, `.gr-pagebtn`, `.gr-mini` |
| `input` · `textarea` | `.gr-in` |
| `progress` | `.gr-meter` |
| `dialog` · `alert-dialog` | `.gr-modal` |

### The button

`variant` carries the fill, `size` carries the geometry, exactly as the handoff splits `.gr-btn`
from `.pri` / `.danger`. The common call is `<Button variant="chrome" size="chrome">`.

Variants: `chrome` (default surface) · `primary` (teal) · `danger` (outline oxide) ·
`danger-solid` (filled oxide). Sizes: `chrome` (30px) · `page` (26px, not uppercase) ·
`mini` (20px). shadcn's six stock variants are still there and unused — leaving them is what keeps
the file regenerable.

### Four things worth knowing before writing a screen

**A label that is also a link is `<Overline asChild><Link …/></Overline>`, never a `<Link>` wrapped
around an `Overline`.** Wrapping puts a 12px element around 10px text. The wrapper is the flex item,
its line box carries a strut at the inherited font size, and that strut is taller than the span
inside — so the label lands about a pixel and a half below a bare `Overline` beside it. It showed up
first in the auth card's `register · or · sign in` row, and the shell's meta row had it too. `asChild`
makes the link *be* the label: one element, one font size, nothing to disagree about.


**`Segment` is not `Tabs`.** They look alike, and Radix Tabs is the wrong primitive: a tab picks
one of several views, a segment is a checkbox wearing a pill and several are on at once. It is a
`<button aria-pressed>`, the toggle-button pattern.

**`RowActions` needs `group/row` on the row.** The glyphs are revealed by the row's hover, and the
group is named because the index has other group ancestors. They also appear on `focus-within` —
opacity-0 is still tabbable — and stay visible below `@3xl`, where there is no hover at all.

**Priority has four levels, not three.** The handoff shows `high / med / low`; `schemas/` validates
`low / medium / high / highest`, which is what the database stores. The schema wins — three bars
could not tell `high` from `highest`. The empty string is a real, distinct state and renders as
four dim bars.

**The caret is an underscore, and it is drawn** (revised in COS-298). The handoff writes
`content: "\2588"` — the full block — and copying it made the caret taller than the text it closes:
U+2588 fills the em box, and overshoots it in Plex Mono, while the letters beside it reach cap
height. A 24px slab next to 17px letters reads as a rendering fault, not a caret. Two changes
followed: the mark is a box with stated dimensions rather than a glyph whose metrics we inherit, and
it is an **underscore** rather than a block — a solid slab is the heaviest thing on a screen made of
1px rules, 1px light edges and a 6px meter, where an underscore is the same terminal signal at the
system's weight.

Its dimensions are the one place `em` beats the spacing scale: half an em wide and `0.08em` thick —
2px under a 24px title, 1px under 12px text — so it tracks whatever it closes. A caret that does not
scale with its own text is the bug being fixed.

---

## 9. The shell

Established by **COS-292 (DS 03)**. `components/shared/shell/` — the frame every application
screen is rendered into, mounted once in `app/(private)/layout.tsx`:

```
AppShell        the screen root: @container, h-dvh, the grey field
  TopChrome     38px — wordmark, the four module tabs, account meta, LED
  Desk          the cards float here; the only thing that scrolls
  StatusBar     26px — state word, the screen's keyboard hints, one value at the right
  TabBar        below @3xl only — the four modules as a bottom bar
```

`SHELL_TABS` (`shell/config/constants.ts`) is the single list of modules; the chrome and the tab bar
both render it, so they cannot drift. `useShellRoute` answers two different questions — **which
screen** (the status bar's hints) and **which tab is lit** — because they differ on a record, where
`index` stays lit. `useShellCounts` fetches the only real data up there.

### It is written in utilities, not in a stylesheet

The ticket recommended a `styles/components/chrome.css`, on pfa's model. It is not there, and that is
deliberate: pfa's `chrome.css` exists for what utilities genuinely cannot say — gradient borders
across `padding-box` and `border-box`, `::-webkit-scrollbar`, `:has()` scrims. The GRAPHITE shell
needs none of that, DS 02 already put its own `@max-3xl:` overrides inline (see `Card`,
`CommandBar`), and a second idiom for four components would cost more than the dense responsive
block saves. **There is no `styles/components/` directory.**

### The screen root is the system's one container

`AppShell` carries `@container`. Every `@max-3xl:` variant in this system — here, in `ds/`, in the
restyled `ui/` — resolves against it, which is what makes the interface fold on the width of the app
panel rather than the window (§7).

Two consequences worth knowing. `container-type` makes that element the containing block for
`position: fixed` descendants; it spans the viewport exactly, so nothing inside notices. And
**anything portalled to `document.body` lands outside the container** and gets no `@max-3xl` at all —
which is why `ui/dialog` carries no width variants. That boundary, and what to do at it, is in §7.

### What is alive and what is furniture

`IDX/2.4.1`, `uptime 04:12` and `sync 12s` are **static chrome** (§8.1 of the spec) and live as copy
in `@text/shell.ts`. They are rendered exactly as written: no interval advancing the clock, no
blinking LED, nothing that suggests a reading. The tab counters and the account email are the only
real values in the shell.

Counters print on three digits (`index 312`, `alarms 004`) and render **nothing** until the number
arrives — `000` would be a wrong answer, not a pending one.

### The status bar's content is copy, keyed by screen

`SHELL_STATUS` in `@text/shell.ts` holds each screen's hints and, where it is static, its right-hand
value. A layout cannot take props from the page it renders, and the alternative — a store every
screen writes into on mount — buys a flash of the wrong content and an effect per screen in exchange
for a table of constants. Two screens compute their right-hand slot from the counters instead; the
record screen's `record <id>` is left to COS-301, which owns that route.

### The fold is narrow, not mobile

Below `@3xl` the chrome keeps only the wordmark and the LED, grows to 48px, and the four tabs
reappear as `TabBar` at the bottom. Because the switch is a container query, that happens in a 700px
split view on a large display exactly as it does on a phone — so the component is `TabBar`, not
`MobileTabBar`.

### Four small departures from the handoff

- **The tabs carry a transparent border at rest.** The handoff adds a border only to the lit tab,
  which makes it 2px larger than its neighbours and nudges the row. Same for the tab bar's buttons.
- **The desk scrolls** (`overflow-auto`). The handoff keeps it fixed and has each card scroll its own
  body; GRAPHITE screens behave identically either way, and the legacy screens that are taller than
  the viewport would otherwise be cut off.
- **`bkmk-fade` moved from 4px to 2px**, the handoff's figure for a screen entrance. DS 01 wrote 4px
  before anything consumed the keyframe; the desk is its first consumer, through
  `animate-gr-screen`.
- **The desk is keyed on the pathname.** The shell lives in the layout so the chrome never remounts,
  which is also why an animation declared on the desk would play once per session. Keying it on the
  path replays the entrance on every route change — and leaves the query string out, so paging
  through the index does not flash the table.

### What the shell replaced

`shared/navBar/` (NavBar, UserMenu and their two content components) and
`shared/helpers/useIsWindowResponsive.ts` are **gone**: the chrome does that job, and the fold is a
container query now. Deleting the user menu orphaned `common/dropdown/`, which went with it, and with
it the `use-onclickoutside` dependency that stopped at React 18.

`shared/Layout.tsx` lost its navigation bar and keeps only the old tool bar and sort bar, because
nothing replaces those yet — removing them would cost the legacy screens their pagination, filters
and record actions several tickets before the GRAPHITE command bar arrives. The account email is the
one sign-out affordance left until UI 09 puts one in About; it points at `/logout`, which AUTH 04
(COS-296) turns into a `POST /users/logout`.

### The second frame: `AuthShell` (COS-297)

The two public auth screens get their own frame, a sibling of `AppShell` rather than a variant of it:

```
AuthShell       @container, h-dvh, the same grey field
  header        38px — wordmark, the screen label, the build tag, LED
  main          grid place-items-center — the 480px block
  status bar    26px — the state word and the screen's key hints
```

**Why not `TopChrome` with a prop.** The application chrome exists to carry the four modules, the
index counters and the account email, and every one of those needs a session — which is exactly what
these screens do not have. Sharing one component would mean a flag switching three quarters of it
off. What *is* shared is what belongs to the system rather than to a screen: the `@container`
declaration every `@max-3xl:` variant resolves against, the 38px strip, the field colour, `h-dvh`.

The block is centred by `place-items-center` on a grid, not `justify-center` on a flex column: at a
height where the card no longer fits, grid centring still allows the overflow to scroll, where a
centred flex child gets clipped at the top.

### The two cards inside it (COS-298)

UI 01 rendered both screens from one form, because both were two fields and a button. UI 02 gave
sign-up two confirm fields, a strength gauge and a recovery passphrase, and one
component with a flag would have been four conditionals deep to draw a screen with two fields. So
`authForms/` holds **two forms and three shared parts**:

```
authForms/
  AuthCard      the .gr-card at padding 22, the server's refusal, the action row
  AuthField     a ds/Field with its message wired to it through aria-describedby
  SignInForm    identity · key
  SignUpForm    identity · key + confirm key · strength · passphrase + confirm
```

**Only one of the two pairs is side by side.** `key` / `confirm key` share a row, as the handoff
draws them: they hold something short. The passphrase pair is **stacked**, because a passphrase is a
phrase — at half width it wraps mid-sentence, on the one field where being able to read back what you
typed is the whole point.

The split follows the same rule as the shell above: share what belongs to the system, not the
branches. `AuthCard` is the surface both screens are made of; `AuthField` exists because the wiring
between an input and its error message is the part that gets forgotten, and doing it by hand five
times is five chances to get it wrong.

Validation comes from the zod schemas — `SignInPayloadSchema` for one, `SignUpFormSchema` for the
other — so neither form can drift from what the API accepts. The submit is disabled only while a
request is in flight, never by validity: a primary action that will not press and does not say why is
worse than an error message under the field that caused it.

**`ds/Field` gained two slots, `action` and `message`, and where each renders is the point.** `hint`
sits *inside* the `<label>`, which is what you want — "key, 12+ chars" is a better accessible name
than "key". The other two do not: a `<button>` inside a `<label>` puts an interactive element inside
another element's name and clicking it also activates the label, and a message is a description that
rewrites itself as you type. So both are the label's siblings in the header row.

⚠️ **The header row is `flex h-4 items-center gap-2 leading-4`, and every part of that is
load-bearing.** Two fields side by side have to put their labels *and* their inputs at the same
height, and **baseline alignment cannot promise either** — each header is its own flex container, so
the shared baseline is set by whichever child has the greatest ascent. Put a control in one column
and that column's text and input both shift.

It took three attempts, which is worth recording so nobody spends the afternoon on it again:

1. a `MiniButton` (20px) in a row that sized itself grew that column's header — its input landed 6px
   low;
2. replacing the button with text wrapped in a `<span>` moved the *other* column instead, by three: a
   blockified flex item carries a strut at the **card's** 12px font size, not the label's 10px;
3. fixing the row's height stopped the input moving but not the text inside it, because baselines
   still resolved differently per column.

What holds: one line tall, `leading-4` forcing every child's line box to that same 16px, and
`items-center` — 16px boxes centred in a 16px row land at an identical offset whatever the row
contains. Labels and messages are `whitespace-nowrap` so nothing can fold, and a control in `action`
carries its own `ml-auto` with no wrapper.

**The control is a `MiniButton` again, and attempt 1 is the reason it can be.** With the row's height
fixed, a 20px control centres itself and overflows two pixels each way into the 6px gap above the
input; it cannot stretch a row that is told how tall it is. Spelling the toggle as text was a fix for
a problem that lived in the row, not in the button — so the row keeps the fix and the screen keeps
the handoff's smallest control.

**Validation timing, which is a system rule and not a screen's:** validate on leaving a field, clear
on the keystroke that fixes it, and say nothing about a field the visitor has **emptied** until they
submit. `mode: "onTouched"` gives the first two. The third needs `isSubmitted`, because
react-hook-form keeps the last verdict — clearing a short key left "min 12 chars" standing over a
blank box, which is being told you are wrong before you have written anything. An empty field is
still invalid, so the message returns on submit, which is the moment it is genuinely useful.

**With one exception: a confirmation field reports its mismatch live**, without waiting for a blur.
Waiting is right for "min 12 chars" — you have not finished typing — and wrong for a confirmation,
where you are copying a secret you cannot read and the entire value of the field is being told *while
you type* that the copy has diverged. The form compares the pair itself and raises
`MISMATCH_MESSAGE`, which is exported from `schemas/auth.ts` where the same rule is enforced on
submit: two places may say it, neither can say it differently. Empty still means "nothing typed yet"
rather than "different".

**Six departures from the handoff on this screen**, the first three of the same kind — the mockup
draws the look of a thing and not the thing; the last two are the owner's call on copy and on a
field's states:

| Handoff | Here | Why |
| --- | --- | --- |
| a bare 62% bar | the bar **plus a word**, and the bar `aria-hidden` | A gauge with no label says nothing when read aloud, and a bar and a word carrying the same judgement is one signal twice. The word is the one that survives. |
| no such field | `recovery passphrase`, revealable **and** confirmed | Recovery by email is abandoned (COS-298); this pair replaces it. A mistyped key costs one more attempt; a mistyped passphrase is found the day it is needed, which is the day it cannot be repaired. The reveal catches the typo you go looking for, the confirm the one you do not. One toggle per pair, at the end of the pair's label line, unmasking both halves — a single control over a pair is what that placement means. |
| `[x] import my Session Buddy export after signup` | **gone** | Built, then dropped: registering and importing are two decisions, and tying the second to a checkbox on the first only buys a redirect to a screen the chrome already reaches. `ui/checkbox` went back to the registry version with it — nothing renders it yet, and repainting a component no screen uses is groundwork pretending to be work. |
| `keys stored locally` · `self-hosted · no tracking` · `tab next field` | **gone** | Decoration. The first is also untrue on its face — it reads as a claim about browser storage, which since AUTH 04 holds nothing — and Tab moves between fields in every form on the web. What the freed spot in the action row now carries is the server's refusal. |
| `create an index` · `sign in to the index` | `create an account` · `sign in` | The handoff's titles rest on "the index" being the product's word for the collection, which it is — About and the facts block both use it. The screens still name the act rather than the thing behind it: a visitor with no account has no index to create. One line each in `text/auth.ts`. |
| `.gr-in:focus` swaps `border-color` to the accent **and** rings the field | the 3px ring alone, `focus-visible` and `aria-invalid` both | Two edges for one state: a soft band, then a hard hairline biting the box inside it — and on an invalid field that hairline is the only saturated colour on a panel of greys. The ring says it once. `transition-[box-shadow]` follows, since no border colour is left to animate. Applies to `ui/input` **and** `ui/textarea`; buttons still tint their border on keyboard focus, where the ring alone would vanish into the teal fill. |

The strength score is a **heuristic and says so in its own file** (`helpers/passwordStrength.ts`):
length dominates, character variety adds one step and no more, and nothing here knows whether the
phrase is on a leak list. zxcvbn would, and is 400kb shipped to one field on one screen. The rule is
`SECRET_RULES.passwordMin`; the gauge is a nudge next to it, not a verdict.

---

## 10. The index (COS-299)

The heaviest screen in the system, and the one every convention below was written for. Two cards:
the rail at 196px, the table card filling the rest, `gap-3` between them.

```
grid-cols-[--spacing(49)_1fr]      196px rail + table card
  rail          caption (fixed) · categories (scrolls) · scopes (fixed)   @max-3xl:hidden
  table card    mobile rail · command bar · table · pager
                   header row  h-7   28px
                   row         h-7.5 30px  ← the density IS the design
  columns       pri 36 · stars 62 · title 1fr · tags 188 · shot 44 · added 88   gap-x-2
```

**The rail is a three-part column and only the middle part scrolls** (COS-300). The card was the scroll
container first, which scrolled everything: `INDEX · CAT` slid up under the top edge, and on a real
index of fifty-three categories the four scopes sat 1500px below the fold — four working filters, out of
reach. Now the caption and the scopes block are `shrink-0` and the category list takes `min-h-0 flex-1
overflow-y-auto`. Measured: the caption and the scopes stay at the same y after scrolling the list 811px,
and the card's own `scrollHeight` equals its `clientHeight`.

**Every column is left-aligned, and there is a gutter between them.** The handoff butts its columns
together and right-aligns `added`; at these widths that printed `PRISTARS` in the header and touched
the bars to the stars underneath. 8px is the smallest gutter that separates them, the `1fr` title pays
for all six, and `added` joins the other five on the left — it was right-aligned because that column
also held the actions, which it no longer does.

**The URL is the whole state.** `readIndexQuery` parses the address bar into the filter object and
everything is a function of it: which rows are fetched, which rail row is lit, what the query field
reads, which page the pager shows. No store, so nothing can disagree with anything; the back button
undoes a filter; a filtered index is a link you can send. Every control in the rail, the header row
and the pager is a `<Link>`, which is also what makes middle-click and ⌘-click behave.

`helpers/indexQuery.ts` owns all three forms that state takes — the URL, the API query, and the
expression a human reads — and nothing else converts between them. Two rules in it are load-bearing:

- **the API query's keys are sorted**, because that string is the react-query cache key, and
  `?starred=1&page=0` and `?page=0&starred=1` are one page that must not occupy two entries;
- **changing a filter resets the page to 0.** Page 3 of a query that now matches 12 rows is an empty
  table with no explanation.

⚠️ **`queryFlagSchema`, never `z.coerce.boolean()`, for a flag that arrives as a string.** Coercion is
`Boolean(value)` and every non-empty string is truthy, so `?screenshot=0` switched the filter **on**.
The QA suite caught it; it was wrong on the three flags that predate this screen too, and on both
sides of the network. Both are fixed, and the backend reads its flags from `req.validated.query` —
the schema can only help if the validated value is the one read.

### How a 30px row is clickable without being a control

The title is a real `<Link>` whose `::after` covers the row (`after:absolute after:inset-0`). The
click target is the whole row and the thing clicked is still an anchor: Enter opens it, the status bar
previews where it goes, and no `div` needs a keyboard handler bolted on. The row actions then sit
**above** that overlay (`relative z-1`), which is why not one of them needs `stopPropagation` — they
are in front of the link rather than inside it, and interactive elements nested in an anchor would be
invalid markup anyway.

The alternative the handoff uses — `onClick` on a `div`, `stopPropagation` on every button — is the
same effect built the way that fails a keyboard, and it is the source of most of the legacy lint
errors this project has agreed to stop adding to.

**ARIA table roles over a CSS grid.** Six columns that line up across a scroll container at 30px a row
is what `<table>` cannot do without a fight, so the structure is divs and the semantics are put back
by hand: `table` → `row` / `rowgroup` → `row` → `cell`, with `aria-sort` on the headers that carry it.
Biome's `useSemanticElements` and `useFocusableInteractive` both fire on exactly this, correctly by
their own rule and wrongly here; they are switched off for `components/bookmarks/Index*.tsx` in
`biome.json` rather than suppressed line by line a dozen times.

**`asChild` is now the DS's answer to "this control navigates".** `Overline`, `Segment` and `RowAction`
all take it, for the same reason each time: a filter, a category and `↗` are addresses, and an address
has to be an `<a>`. The state attribute changes with the element — `aria-pressed` on a link would
announce a control that does not exist, so a link gets `aria-current`.

### What is deliberately not on this screen yet

| The handoff draws | Here | Why |
| --- | --- | --- |
| a 58px `id` column | **gone** | A database key among titles and dates. It cannot be sorted by, it does not help you find a record, and the legacy list did not show it either. Owner's call. |
| the screenshot as a glyph beside the title | a **`shot` column**, 44px, sortable | Back from the legacy list, where it is a column of its own. A column is what makes it scannable down the page, and `screenshot` is one of the backend's sort cases, so the header does something. The alarm glyph stays beside the title — one row-level mark is enough there. |
| `all 312`, `dev 188`, `demoscene 041` | one real count, on the row it describes | Per-category counts are DATA 05 (COS-310). There is exactly **one** number available — the current query's `total_count` — and pinning it to `all` regardless was a bug: selecting a category showed `all 002`. `countedRow` puts it on `all` when nothing is filtered, on a category when that is the only filter, and nowhere when no single row describes the query. |
| `storage` — `shots 84/312` + gauge, `db 1.4 mb` | **absent** | Same ticket, and nothing to wire: a permanent `0/0` is worse than a block that arrives meaning something. |
| a `filter ⌥F` button, and a query field that opens the modal | both, since COS-300 | UI 03 shipped the field read-only, because a button that opens nothing is worse than a button that has not arrived. UI 04 brought the modal, and with it the button and the field's click — see §11. |
| `> tag:demoscene stars:>3` | `cat:demoscene stars:1+ prio:high\|highest` | That is a query *language*; the app has a filter object. `describeQuery` prints the object in the same shape, so the line is readable and also true. |
| chip colours from a `tagPalette` fixture | hue from `category.color` | The prototype has no database; bkmk does, and the colour is the user's own. GRAPHITE keeps the treatment — `hsl(hue 34% 32%)` — so eighteen chosen colours cannot turn a screen of greys into a pin board. Grey or unparseable falls back to a hash of the name, not to one shared default. |

**Three scopes needed a server.** `has shot` was expressible (`screenshot` is a presence test);
`starred`, `has alarm` and `prio high` were not — `stars` compared for equality and `reminder` for an
exact frequency. Four checkboxes of which one filters is worse than none, so
`getBookmarksController` gained three parameterised conditions, in the shape DATA 01 (COS-306) will
formalise. `prio high` sends `high,highest`: a shortcut named for the level below the top would hide
the records that matter most. **COS-300 finished the set and cost two of those parameters their
shape** — see §11.

**Every column sorts, as the legacy list had it** — which `tags` could not, until it was given a
server-side order. It sorts on the aggregated category names (`categories_names`), so `amiga,css` comes
before `demoscene,dev` and untagged rows collect at one end. The same change made the three
`GROUP_CONCAT`s share one `ORDER BY c.name`: they are zipped back together by position, so they have to
agree, and the side effect is that chips now come out alphabetical.

### Two places nothing may move

**The action strip is out of the flow, and always three buttons wide.** It is `absolute` against the
row, pinned to the right edge, inside the last cell so the row keeps its six cells. Two reasons, both
measured:

- while it stood in the flow, `added` had to be 168px — a date plus 70px of blank column. Now the
  column is 88px, the width of a date, and hovering swaps the date for the actions **in place**;
- `↗` renders `disabled` on a record with no url rather than being left out. In the flow, a strip one
  button narrower pushed those rows' dates 22px right; out of the flow it cannot, and the rule stays
  anyway — hovering a row must not resize anything.

Measured after: 22 dates on one left edge, headers and cells sharing a left edge column by column, and
an 8px gutter between every pair.

⚠️ **Out of the flow is a rule for the wide table, and it does not survive the fold** (COS-326). Below
`@max-3xl` five of the six cells are hidden and the row loses the `added` column the strip was floating
over — so the strip was painted straight onto the url, measured at 420px as **86px of glyphs over the
end of the line** on every row whose url is long enough to reach them. It is worse than a hover
artefact: `RowActions` is `@max-3xl:opacity-100`, because a touch screen has no hover, so the overlap
was permanent.

The folded row is therefore **two columns**, `1fr auto`, and the strip takes the second one:
`@max-3xl:relative @max-3xl:inset-auto` on the same element that is `absolute` above the fold. `relative`
and not `static` — `z-index` is ignored on a static box, and the title link's `::after` overlay would
take every click meant for a button. Measured at 420px: no intersection on any row, the truncated url
stopping 8px short of the strip, the three buttons 26×26 and each of them the top element at its own
centre, and the wider `delete? · confirm · cancel` state still inside the row. At 1440px all six rows
are byte-identical to the measurement taken before the change.

**Both pager arrows are always rendered**, the unavailable one `disabled`. They were absent at the ends
first, with a spacer holding the gap, and the spacer was square while the button is wider than tall —
so arriving on page 1 shoved `page 01` sideways. A disabled button holds its own geometry exactly. The
last page number is a link, as it was in the legacy pager: `/57` jumps to the end.

### The scrollbar is a design system component

`gr-scroll` in `styles/utilities.css` — the first thing this system could not write as a Tailwind class.
6px, no track, a thumb in the panel's border ink. The native bar was wrong on three counts: 15px wide on
macOS with a mouse attached, a light track that reads as a gutter cut into the card, and a shape GRAPHITE
did not choose.

⚠️ **`scrollbar-width` is set only where `::-webkit-scrollbar` does not exist.** Chrome and Safari
support both and *ignore* the pseudo-elements when the standard properties are present — with
`scrollbar-width: thin` set unconditionally the rail kept Chrome's own bar, measured at 11px. Hence
`@supports not selector(::-webkit-scrollbar)`, which is false exactly in the engines that implement
them. And no `scrollbar-gutter`: reserving the channel is the margin-on-one-side look the utility exists
to remove.

The rail scrolls vertically and **never horizontally** (`overflow-x-hidden`): every label truncates, so a
horizontal bar could only mean something is mis-sized — and it did, when a fixed `3ch` counter clipped a
four-digit total to a plausible-looking `127` and pushed the row wide. `min-w-[3ch]` now: three digits
is the handoff's padding, not a ceiling.

**Where the bar sits is two numbers, and both were wrong once** (COS-300). An overlay thumb — macOS
Chrome's default — is painted *over* the content instead of in a reserved channel, so the scroll
container's own edges decide whether it lands on a row or beside one:

- the padding is on the scroller, **not** on the card. On the card, the list's right edge sat 14px inside
  the panel, which is on top of the rows, and the bar covered a row's rounded right corner;
- the scroller keeps `mr-1.5`, because moving the padding in without it put the bar hard against the
  panel's border, which reads just as wrong from the other side.

Measured: **8px** between a row's right edge and the bar, **7px** between the bar and the panel's border.

⚠️ **And `min-w-0` on the row, which is a different bug wearing the same clothes.** A grid item's
automatic minimum size is `min-content`, so a rail row refused to be narrower than its longest
untruncated label — measured at **175.8px inside a 166px track**, overflowing 9.8px to the right where
`overflow-hidden` clipped it. *That* is what turned `all 1278` into `all 127`; the bar was never the
cause, it only made the overflow visible. The label's own `min-w-0 flex-1 truncate` could not fire
because the row it lives in was never asked to fit. The track half of the fix is `grid-cols-1`, which
Tailwind spells `repeat(1, minmax(0, 1fr))` for exactly this reason.

**The default sort is `-date`, and it stays out of the URL.** The backend's own default is no
`ORDER BY` — "whatever the storage engine hands back", stable enough to look deliberate. An index
wants the last thing you saved at the top, and the handoff's pager agrees (`sorted by added ▾`). Kept
out of the address bar so a clean link stays clean and one page stays one cache entry.

---

## 11. The filter modal (COS-300)

The first real modal in the system, and the screen's one piece of state that is **not** in the URL.

```
min(640px, 100% - 20px)   ·   max-h calc(100dvh - 24px)   ·   rounded-2xl   ·   shadow-gr-modal
  header   FILTER · advanced · live · 27/1278 match · ×          CommandBar, sticky top
  body     title · categories · [stars | priority] · [reminder | contains] · expression
  footer   filter — 27 results · reset · live · 14 ms            sticky bottom
```

### A draft, not seven navigations

Everywhere else on the index a control is a `<Link>` and a click is a navigation, because the query
lives in the address bar (§10). Here seven controls describe **one** filter, and applying each as it is
clicked would be seven navigations and seven round trips to reach one list. So the modal edits a draft
in `useState`, counts it live, and applies it in a single move — which is what the handoff's footer
already says it does: `filter — 27 results` is a button, not a status line.

The draft still resolves to an **address**: the primary action is a `<Link>`, so ⌘-click opens the
filtered index in a tab and the back button undoes all seven filters in one step. `toFilterHref` is
what builds it, and it is deliberately a different function from `toIndexHref` even though one calls
the other with an empty patch — every other control *patches* the query, the modal *replaces* it, and a
filter the user has just cleared has to disappear rather than be treated as "unchanged".

⚠️ **The draft is seeded when the modal opens, and only then.** Radix unmounts the content while
closed, so `useState(query)` inside `FilterForm` re-initialises on every open — which is the only
reason the form is a component of its own. Without that split, a draft edited and then abandoned would
come back on the next open instead of the query actually on screen. Verified: `esc` after a change,
reopen, and the segments are the URL's again.

### `live · 14 ms` is measured, and everything on this screen has to be

`useFilterCount` asks for `rows=1` — the cheapest page that still carries the controller's separate
`COUNT(DISTINCT b.id)` — debounced 300ms on the *whole* API query string, so a typed word costs one
request and a click costs one immediately. The elapsed figure in the footer is that request's real
round trip. The handoff prints a static `4 ms`; a hard-coded latency is a performance claim nobody
measured, and it is the one kind of decoration that also misleads. It stays blank until there is
something to report rather than printing `0`.

### The filter object lost two parameters, and each control owns exactly one field

COS-299 gave the rail four scopes and the backend three new conditions. Building the modal's controls
out of them did not work, and the fix was fewer parameters, not more:

| COS-299 | COS-300 | Why |
| --- | --- | --- |
| `stars` compared with `=` | **`>=`** | The design's group is `any · 1+ · 2+ · 3+ · 4+ · 5`. A minimum is what a rating filter means, and the equality could not express it — asking for `3+` returned the three-star records and hid the four- and five-star ones. |
| `starred`, a flag for `stars > 0` | **gone** | With a minimum, "rated at all" is `stars=1`. The rail's row and the modal's `1+` segment now write the same filter instead of two spellings of one. |
| `alarm`, a presence flag | **an enum**, `armed \| none \| due` | The reminder group is a single four-way choice. Three booleans can contradict each other — `?alarm=1&no_alarm=1` is a request with no answer — so it is one field with three values, `any` being its absence. |
| `reminder`, an exact frequency | **gone** | Only the legacy inline filter panel's dropdown ever sent it, and that panel left with this ticket. `alarm=due` answers the question it was reached for. |
| `priority`, four levels | **five**, `none` included | The modal draws `—` for a record with no level. `NULL` is not a value `IN` can match, so the controller splits `none` back out into an `IS NULL` **alternative** — one condition with an `OR`, not two that would `AND` into nothing. |

`alarm=due` is the only condition in `getBookmarksController` that computes anything. An alarm has no
next-fire column: it repeats every `frequency` days from `date_added`, which is how the reminders
controller decides one fires today. So days-until-next-fire is
`MOD(frequency - MOD(DATEDIFF(CURDATE(), date_added), frequency), frequency)` — the outer `MOD` is what
makes an alarm firing *today* come out 0 rather than a whole period — and `frequency > 0` guards the
modulo, because the column has no constraint and `MOD(x, 0)` is `NULL`, which would drop rows silently
instead of failing. The window is 3 days, and **that number is written twice**: `REMINDER_DUE_DAYS` in
the controller and the `≤ 3d` label in `@text/index.ts`. Same hand-copied arrangement as
`FIELD_LIMITS`, and flagged in both files.

A link written before all this — `?alarm=1`, `?starred=1` — degrades to *no filter* rather than to an
error: `catch(undefined)` on the enum, and an unknown key is stripped.

### The two numbers that decide the layout

**6px between segments, not 14.** The handoff gives a row of segments `gap: 6` and the `contains`
checkboxes `gap: 14`; this shipped with 14 everywhere first, and the 8px difference was enough to wrap
two rows — `stars` needs 272px on one line and had 291 to spend, but at 14px it wanted 312, so `5` sat
alone under the star row and `low` under the priority row. The faithful gap is also the one that fits.
14px survives for the checkboxes, and for a reason: a pill carries its own edge, so 6px reads as a
separation; three bare `[x] label` pairs at 6px read as one string.

**`min-w-72` on each half of a pair, and it is measured.** 288px is the next step above the 272 the
widest of these rows needs. That makes the fold binary — either both halves are at least 288 wide and
neither wraps internally, or they stack and each gets the modal's full width. The in-between, where a
column is wide enough to sit beside its neighbour but too narrow for its own contents, is exactly the
state that printed the lone `5`. Measured after: two columns at 291px each on a 640px modal, all four
rows on one line; stacked at 358px each on a 420px viewport, still one line each, 10px of gutter on
both sides.

### The category picker, after the cloud was thrown out

The categories control shipped twice. The first version drew **all fifty-three** as chips: seven rows,
204px, capped and scrolled. The owner's verdict was *"un gros pavé indigeste"*, and it was right —
nobody reads fifty-three pills to find `dev`, and the legacy app's plain multi-select was better at
this. `CategoryPicker` replaced it with **a token field you type into, and one row of suggestions**:

- nothing typed → the **ten most used**, ranked by `bookmarks_count`. On the live index that is
  `dev 960`, `youtube 916`, then a long tail — so the two categories that carry the archive are one
  click away, and the ranking is a real number.
- typing → the **ten best matches**, alphabetical, with `+N more` when there are more than ten.
- selected categories stay in the field as removable tokens either way, so one outside the top ten
  cannot be selected-but-invisible.

`↵` adds the first suggestion, `⌫` on an empty field removes the last token. A token is **one button
that deletes itself**, not a chip with a nested `×` — a button inside a button is invalid markup, and
the whole token is a bigger target than a 10px glyph.

**Most used needed a server.** `GET /categories` returned bare table rows; it now carries
`COUNT(DISTINCT b.id)` per category, with `b.active = 1` in the **join condition** so that the eight
categories nothing uses come back as `0` instead of vanishing. That is the whole of it — the rail's
`dev 188` counters are still empty and still DATA 05 (COS-310); the number merely exists now.

⚠️ **`esc` clears the search without closing the modal, and the state is lifted for that one reason.**
Radix's dismiss listener is on `document` in the **capture** phase, so it runs before the event reaches
the input and `stopPropagation` inside the field is too late — that was the first attempt and the modal
closed anyway, taking the draft. The supported hook is `onEscapeKeyDown` on `DialogContent`, which is a
prop two levels up, so the search string lives there. On an empty field `esc` closes as usual.

**No floating listbox.** A dropdown inside a modal whose panel is the scroll container gets clipped by
that panel, or needs a portal and a second focus scope to escape it. A row that changes content needs
neither and is one line of the same `Segment` the rest of the modal is built from. For the same reason
it is not `role="combobox"`: with no listbox to own, the role would describe a widget that is not there.

### Small things, decided

- **`⌥F` opens and never closes.** `event.code === "KeyF"`, not `event.key`: on macOS `Alt` is a compose
  key and `⌥F` produces `ƒ`. The handoff's own control toggles; this one does not, because the modal
  contains a text field and `⌥F` typed into it would throw away a draft. `esc`, the backdrop and the `×`
  all close it, which is three ways too many to need a fourth. The status bar's hint was corrected from
  the handoff's `f filter` to `⌥f filter` — a hint naming a shortcut that does nothing is worse than no
  hint.
- **The close glyph is in the header row**, after the match count, as the handoff draws it.
  `DialogContent`'s own is absolutely positioned and would sit on top of that count, so this modal
  passes `showCloseButton={false}` and puts a `DialogClose` in the flow.
- **`ui/dialog` carries the GRAPHITE width now**, `w-[calc(100%-1.25rem)] max-w-160`, replacing
  shadcn's `sm:max-w-lg`. The gutter is the fluid half and stays; a modal that wants another size
  changes the cap — `max-w-110` for the delete confirmation (COS-320), `max-w-170` for the edit modal
  (COS-319). `alert-dialog.tsx` still has the stock width and no consumer; COS-320 is where it lands.
- **The entrance is `bkmk-pop` under another name.** `fade-in-0 zoom-in-95` over 200ms is that
  keyframe's `opacity 0 → 1, scale .96 → 1` written in `tw-animate-css`'s vocabulary, which is what
  `styles/animations.css` already said.
- **Mutual exclusion with the edit modal** — the handoff's `openEdit` closing this one — is COS-319's
  to wire. It owns the state that would close this, and there is nothing to exclude until it exists.
- **No `nuqs`**, which the ticket asked us to consider. The URL is already the state and
  `helpers/indexQuery.ts` already owns every conversion; the library would replace a file this system
  documents with a dependency, and the modal's draft is the one piece of state that is deliberately
  *not* in the URL.

---

## 12. What is still legacy

Three files still carry tokens from the old UI, marked as such: **15 colours** in `colors.css`,
**2 shadows** in `elevation.css`, **3 sizes and 3 families** in `typography.css`. They are not this
ticket's debt: they keep alive the screens the UI lot has not rebuilt, and they leave screen by
screen with it.

Two resets are still waiting: the page background (`base.css` applies `bg-grey1`) and the `body`
typeface.

⚠️ **UI 01 was supposed to flip them and deliberately did not.** By the time it arrived, both frames
paint their own subtree — `AppShell` for the application, `AuthShell` for the auth screens — so the
global reset has nothing left to do except repaint the two screens that are still legacy, About and
the old tool bars inside the desk. Flipping it would make those look broken rather than dated, for no
gain on any GRAPHITE surface. It leaves with the last legacy screen, which is what `base.css` said in
the first place.
