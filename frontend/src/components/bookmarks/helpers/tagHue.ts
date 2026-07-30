/* The hue of a category chip (COS-299).
 *
 * The handoff colours chips from a `tagPalette` keyed by tag name — a fixture, because the prototype
 * has no database. bkmk does: `category.color` is a real column, chosen by the person who made the
 * category, and it arrives with every bookmark.
 *
 * So the colour is theirs and the **treatment** is GRAPHITE's. `ds/Chip` paints its dot
 * `hsl(hue 34% 32%)`: fixed saturation and lightness, hue from here. That is what keeps eighteen
 * user-chosen colours from turning a screen of greys into a pin board — a stored `#ff0000` reads as
 * the same muted brick as everything else, while still being unmistakably not the green one.
 *
 * A name-hashed fallback covers the rows the column cannot: a colour that is missing, empty, or not
 * a hex triplet. Hashed rather than a single default hue, because two neighbouring chips both
 * falling back would otherwise be indistinguishable. */

/** Hue in degrees, 0–359, from a `#rgb` / `#rrggbb` string. */
function hueFromHex(hex: string): number | undefined {
  const digits = hex.trim().replace(/^#/, "");
  const full = digits.length === 3 ? [...digits].map((digit) => digit + digit).join("") : digits;
  if (!/^[0-9a-f]{6}$/i.test(full)) return undefined;

  const red = Number.parseInt(full.slice(0, 2), 16) / 255;
  const green = Number.parseInt(full.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const span = max - min;

  // Grey has no hue. Returning `undefined` sends it to the name hash, which gives it one rather than
  // leaving every grey category sharing a single colour.
  if (span === 0) return undefined;

  let hue: number;
  if (max === red) hue = ((green - blue) / span) % 6;
  else if (max === green) hue = (blue - red) / span + 2;
  else hue = (red - green) / span + 4;

  return Math.round((((hue * 60) % 360) + 360) % 360);
}

/** A stable hue from a name — same name, same colour, in this session and the next. */
function hueFromName(name: string): number {
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 360;
  }
  return hash;
}

function tagHue(category: { name: string; color?: string | null }): number {
  return (category.color ? hueFromHex(category.color) : undefined) ?? hueFromName(category.name);
}

export { hueFromHex, hueFromName, tagHue };
