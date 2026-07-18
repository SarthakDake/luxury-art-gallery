/** Split `Main | Subline` site names for two-line brand display. */
export function splitSiteName(siteName: string): { main: string; sub: string | null } {
  const trimmed = siteName.trim();
  if (!trimmed.includes("|")) {
    return { main: trimmed, sub: null };
  }

  const parts = trimmed
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return { main: trimmed.replace(/\|/g, "").trim() || trimmed, sub: null };
  }

  return {
    main: parts[0],
    sub: parts.slice(1).join(" · "),
  };
}
