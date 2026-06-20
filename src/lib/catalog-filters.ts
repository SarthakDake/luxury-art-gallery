import type { Artwork } from "@/types/artwork";

export function getCategories(artworks: Artwork[]): string[] {
  return [...new Set(artworks.map((artwork) => artwork.category))].sort();
}

export function getMaterials(artworks: Artwork[]): string[] {
  return [...new Set(artworks.map((artwork) => artwork.material))].sort();
}

export function getSubcategoriesForCategories(
  artworks: Artwork[],
  selectedCategories: string[],
): string[] {
  const scopedArtworks =
    selectedCategories.length === 0
      ? artworks
      : artworks.filter((artwork) =>
          selectedCategories.includes(artwork.category),
        );

  return [
    ...new Set(scopedArtworks.map((artwork) => artwork.subcategory)),
  ].sort();
}

export function pruneSubcategories(
  artworks: Artwork[],
  selectedCategories: string[],
  selectedSubcategories: string[],
): string[] {
  const available = new Set(
    getSubcategoriesForCategories(artworks, selectedCategories),
  );

  return selectedSubcategories.filter((subcategory) =>
    available.has(subcategory),
  );
}

export function resolveCategoryFromParam(
  categoryParam: string | null,
  categories: string[],
): string | null {
  return categoryParam && categories.includes(categoryParam) ? categoryParam : null;
}

export function resolveSubcategoryFromParam(
  subcategoryParam: string | null,
  artworks: Artwork[],
  selectedCategories: string[],
): string | null {
  if (!subcategoryParam) {
    return null;
  }

  const available = getSubcategoriesForCategories(artworks, selectedCategories);
  return available.includes(subcategoryParam) ? subcategoryParam : null;
}
