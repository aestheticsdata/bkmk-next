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

**Snap before creating a token.** If the native Tailwind scale has an equivalent step, take the
native step. Add a token only where the native scale genuinely has nothing. That is why this system
has **no** radius token at all and only **two** text-size tokens.

**Spacing stays on the numbered scale**, half-steps included: `p-3.5` (14px), `py-4.5` (18px),
`px-5.5` (22px). The whole handoff already lands there. **No named spacing tokens** — no
`--p-modal`; repeated spacing gets centralised in the component that owns it.

**No `dark:` variant.** GRAPHITE is a single light-grey theme.

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

The delete flow has its four oxide hues: `gr-oxide-from` `#8d4018`, `gr-oxide-to` `#763512`,
`gr-oxide-border` `#5f2a0e`, `gr-oxide-fg` `#f4ece6`.

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
| 9.5 (micro-label, column header, mini-button) | → 10 | `text-3xs` |
| 10 (chip, slot, status bar) | keep | `text-3xs` |
| 10.5 (button) | → 10 | `text-3xs` |
| 11 (tab, segment, sub-line, timestamp) | keep | `text-2xs` |
| 11.5 (search, rail row) | → 11 | `text-2xs` |
| 12 (table row, key/value) | native | `text-xs` |
| 12.5 (base) | → 12 | `text-xs` |
| 13 (BKMK wordmark) | → 12 | `text-xs` |
| 14 | native | `text-sm` |
| 21 (record title) | → 20 | `text-xl` |
| 24 (About title) | native | `text-2xl` |
| 26 (auth title) | → 24 | `text-2xl` |

**The two judgement calls that change something.** The handoff separates the micro-label (9.5) from
the button (10.5) by one pixel: at that size colour and letter-spacing carry the hierarchy, not
1px, so the two meet at 10. And the three titles (21 / 24 / 26) land on two native steps, which
puts the record and auth titles on their nearest neighbour without creating a single token.

### Letter-spacing

| Token | Value | Usage |
|---|---|---|
| `tracking-caps` | `0.14em` | wide uppercase — micro-labels, column headers, slots, wordmark |
| `tracking-snug` | `-0.015em` | titles |

Control uppercase (the handoff's 0.08 / 0.10em) takes native **`tracking-widest`**, which is 0.1em.
Chips and segments (0.04em) take **`tracking-wider`**, 0.05em. The base's -0.005em is dropped:
0.06px on 12px text, invisible.

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
| `shadow-gr-modal` | the modal — carries its own hair line |
| `shadow-gr-primary` | primary action, with the teal glow |

**The system's signature: every light surface carries `inset 0 1px 0 var(--color-gr-hair)`.** It is
baked into `shadow-gr-modal` and `shadow-gr-primary`; elsewhere it has to be added, which gives
unreadable classes — DS 03 (COS-292) will turn it into a class in `components/chrome.css`.

---

## 6. Spacing and heights

No tokens: everything lands on the numbered scale, half-steps included.

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
| field padding 8/11 | `py-2 px-2.75` |

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

---

## 8. What is still legacy

Three files still carry tokens from the old UI, marked as such: **15 colours** in `colors.css`,
**2 shadows** in `elevation.css`, **3 sizes and 3 families** in `typography.css`. They are not this
ticket's debt: they keep alive the screens the UI lot has not rebuilt, and they leave screen by
screen with it.

Two resets are waiting on the UI lot too: the page background (`base.css` still applies `bg-grey1`)
and the `body` typeface. Flipping them here would strip every page before GRAPHITE has anything to
put in its place — UI 01 (COS-297) does it.
