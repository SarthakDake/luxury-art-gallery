import type { Artwork } from "@/types/artwork";

export function selectCuratedArtworks(
  artworks: Artwork[],
  options: { limit: number; categoryFilter?: string },
): Artwork[] {
  const filter = options.categoryFilter?.trim().toLowerCase();
  const filtered = filter
    ? artworks.filter(
        (artwork) =>
          artwork.category.toLowerCase().includes(filter) ||
          artwork.subcategory.toLowerCase().includes(filter) ||
          artwork.title.toLowerCase().includes(filter),
      )
    : artworks;

  const limit = Math.max(1, options.limit || 8);
  return filtered.slice(0, limit);
}
