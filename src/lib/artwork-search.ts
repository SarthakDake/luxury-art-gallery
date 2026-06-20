import type { Artwork } from "@/types/artwork";

export function normalizeSearchQuery(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function getArtworkSearchHaystack(artwork: Artwork): string {
  return [
    artwork.title,
    artwork.category,
    artwork.subcategory,
    artwork.material,
    artwork.slug.replace(/-/g, " "),
  ]
    .join(" ")
    .toLowerCase();
}

export function artworkMatchesQuery(artwork: Artwork, query: string): boolean {
  const tokens = normalizeSearchQuery(query);

  if (tokens.length === 0) {
    return false;
  }

  const haystack = getArtworkSearchHaystack(artwork);
  return tokens.every((token) => haystack.includes(token));
}

function scoreArtworkMatch(artwork: Artwork, query: string): number {
  const tokens = normalizeSearchQuery(query);

  if (tokens.length === 0) {
    return 0;
  }

  const fields = {
    title: artwork.title.toLowerCase(),
    subcategory: artwork.subcategory.toLowerCase(),
    category: artwork.category.toLowerCase(),
    material: artwork.material.toLowerCase(),
  };

  let score = 0;

  for (const token of tokens) {
    if (fields.title.includes(token)) score += 10;
    if (fields.subcategory.includes(token)) score += 8;
    if (fields.category.includes(token)) score += 6;
    if (fields.material.includes(token)) score += 4;
  }

  return score;
}

export function searchArtworks(artworks: Artwork[], query: string): Artwork[] {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  return artworks
    .filter((artwork) => artworkMatchesQuery(artwork, trimmed))
    .sort((left, right) => scoreArtworkMatch(right, trimmed) - scoreArtworkMatch(left, trimmed));
}
