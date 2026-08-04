"use client";

import { FieldGroup } from "@components/ds/FieldGroup";
import { MiniButton } from "@components/ds/MiniButton";
import { MAX_STARS } from "@components/ds/Stars";
import { cn } from "@lib/utils";
import { CREATE_TEXT } from "@text/create";
import { useId, useState } from "react";

const LEVELS = Array.from({ length: MAX_STARS }, (_, index) => index + 1);

/* `stars`, as five glyphs you click (COS-302) — the read-only `ds/Stars` with a control under it.
 *
 * ⚠️ **Native radios, not buttons**, and this is the one field of the five where the codebase's
 * `Segment` pattern is the wrong answer. A rating is a single choice among ordered values, which is
 * exactly what a radio group is, and going native buys the whole keyboard model for free: arrows
 * move between the stars, the group takes one tab stop instead of five, and a screen reader says
 * "3 stars, radio button, 3 of 5" rather than five pressed-or-not toggles that happen to be adjacent.
 * The `Segment` rows next to it are toggles announced as toggles, so nothing is inconsistent — the
 * two controls genuinely differ.
 *
 * The inputs are `sr-only` and the star is the `<label>`, so the glyph is the hit area and the
 * accessible name is a sentence rather than "black star". `peer-focus-visible` puts the ring on the
 * label, because the input it belongs to is not on screen.
 *
 * The hover preview is the one piece of state here: a star rating where the row does not answer the
 * pointer reads as five decorations. It is pointer-only by construction — nothing sets it from the
 * keyboard, where the selection itself already moves as you arrow through.
 *
 * `clear` rather than a sixth `0` glyph: zero stars is the default and the common case, so it needs
 * a way back and not a place in the row. It appears only when there is something to clear. */
function StarsField({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  const name = useId();
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <FieldGroup
      label={CREATE_TEXT.sections.stars}
      className={className}
      controlsClassName="gap-x-2.5"
    >
      {/* `tracking-tighter` for the reason `ds/Stars` carries it: at this size the glyphs otherwise
          read as five separate words. */}
      <span className="flex items-center tracking-tighter">
        {LEVELS.map((level) => (
          <span key={level}>
            <input
              type="radio"
              id={`${name}-${level}`}
              name={name}
              className="peer sr-only"
              checked={value === level}
              onChange={() => onChange(level)}
            />
            {/* Both pointer handlers on the **label**, not on the row around it: the row is a static
                element and an event handler on one is a control a keyboard cannot reach. Leaving one
                star for the next is safe because `mouseleave` fires before `mouseenter`, so the two
                updates batch and the last one wins. */}
            <label
              htmlFor={`${name}-${level}`}
              onMouseEnter={() => setHovered(level)}
              onMouseLeave={() => setHovered(0)}
              className={cn(
                "block cursor-pointer rounded-sm px-px text-sm leading-5 transition-colors duration-120",
                "peer-focus-visible:ring-3 peer-focus-visible:ring-gr-ring",
                level <= shown ? "text-gr-star" : "text-gr-fg-4 opacity-55 hover:opacity-100",
              )}
            >
              <span aria-hidden>★</span>
              <span className="sr-only">{CREATE_TEXT.aria.stars(level)}</span>
            </label>
          </span>
        ))}
      </span>

      <span className="text-3xs tabular-nums text-gr-fg-4">{CREATE_TEXT.fields.starsReadout(value, MAX_STARS)}</span>

      {value > 0 && <MiniButton onClick={() => onChange(0)}>{CREATE_TEXT.fields.starsClear}</MiniButton>}
    </FieldGroup>
  );
}

export { StarsField };
