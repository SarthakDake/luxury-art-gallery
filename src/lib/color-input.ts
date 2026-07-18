/** Expand #rgb → #rrggbb when needed; return null if not a hex color. */
export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  const short = trimmed.match(/^#([0-9a-f]{3})$/i);
  if (short) {
    const [r, g, b] = short[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  const full = trimmed.match(/^#([0-9a-f]{6})$/i);
  if (full) {
    return `#${full[1].toLowerCase()}`;
  }

  return null;
}

/** Value suitable for `<input type="color" />` (always #rrggbb). */
export function toColorInputValue(value: string, fallback = "#000000"): string {
  return normalizeHexColor(value) ?? fallback;
}
