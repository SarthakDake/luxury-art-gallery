import type { ArtistHighlight, ArtistProfile } from "@/types/site-config";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function defaultHighlightsFromProfile(profile: {
  exhibitions: ArtistProfile["exhibitions"];
  press: ArtistProfile["press"];
}): ArtistHighlight[] {
  const years = profile.exhibitions.map((item) => item.year).filter(Number.isFinite);
  const careerStart = years.length > 0 ? Math.min(...years) : new Date().getFullYear();
  const careerYears = Math.max(new Date().getFullYear() - careerStart, 0);

  const highlights: ArtistHighlight[] = [
    {
      value: String(profile.exhibitions.length),
      label: "Major Exhibitions",
    },
    {
      value: `${careerYears}+`,
      label: "Years in Practice",
    },
  ];

  if (profile.press.length > 0) {
    highlights.push({
      value: String(profile.press.length),
      label: "Press Features",
    });
  }

  return highlights;
}

export function normalizeArtistProfile(raw: unknown): ArtistProfile {
  const source = isRecord(raw) ? raw : {};
  const exhibitions = Array.isArray(source.exhibitions)
    ? source.exhibitions
        .filter(isRecord)
        .map((entry) => ({
          year: Number(entry.year) || new Date().getFullYear(),
          title: String(entry.title ?? "").trim(),
          location: String(entry.location ?? "").trim(),
        }))
        .filter((entry) => entry.title)
    : [];

  const press = Array.isArray(source.press)
    ? source.press
        .filter(isRecord)
        .map((entry) => ({
          publication: String(entry.publication ?? "").trim(),
          year: Number(entry.year) || new Date().getFullYear(),
          link: String(entry.link ?? "").trim(),
        }))
        .filter((entry) => entry.publication)
    : [];

  const hasHighlightsKey = Array.isArray(source.highlights);
  const highlightsFromSource = hasHighlightsKey
    ? (source.highlights as unknown[])
        .filter(isRecord)
        .map((entry) => ({
          value: String(entry.value ?? "").trim(),
          label: String(entry.label ?? "").trim(),
        }))
        .filter((entry) => entry.value && entry.label)
    : [];

  return {
    artistName: String(source.artistName ?? "").trim(),
    artistTagline: String(source.artistTagline ?? "").trim(),
    portraitImageUrl: String(source.portraitImageUrl ?? "").trim(),
    biography: String(source.biography ?? "").trim(),
    exhibitions,
    press,
    highlights: hasHighlightsKey
      ? highlightsFromSource
      : defaultHighlightsFromProfile({ exhibitions, press }),
  };
}
