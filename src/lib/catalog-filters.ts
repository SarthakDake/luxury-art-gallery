import type { Artwork } from "@/types/artwork";

export type CatalogFilterSelection = {
  categories: string[];
  subcategories: string[];
  materials: string[];
};

export type FilterDimension = "category" | "subcategory" | "material";

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function getCategories(artworks: Artwork[]): string[] {
  return uniqueSorted(artworks.map((artwork) => artwork.category));
}

export function getMaterials(artworks: Artwork[]): string[] {
  return uniqueSorted(artworks.map((artwork) => artwork.material));
}

export function getSubcategories(artworks: Artwork[]): string[] {
  return uniqueSorted(artworks.map((artwork) => artwork.subcategory));
}

function getArtworkField(artwork: Artwork, dimension: FilterDimension): string {
  switch (dimension) {
    case "category":
      return artwork.category;
    case "subcategory":
      return artwork.subcategory;
    case "material":
      return artwork.material;
  }
}

export function artworkMatchesSelection(
  artwork: Artwork,
  selection: CatalogFilterSelection,
  exclude?: FilterDimension,
): boolean {
  if (
    exclude !== "category" &&
    selection.categories.length > 0 &&
    !selection.categories.includes(artwork.category)
  ) {
    return false;
  }

  if (
    exclude !== "subcategory" &&
    selection.subcategories.length > 0 &&
    !selection.subcategories.includes(artwork.subcategory)
  ) {
    return false;
  }

  if (
    exclude !== "material" &&
    selection.materials.length > 0 &&
    !selection.materials.includes(artwork.material)
  ) {
    return false;
  }

  return true;
}

export function filterArtworksBySelection(
  artworks: Artwork[],
  selection: CatalogFilterSelection,
  exclude?: FilterDimension,
): Artwork[] {
  return artworks.filter((artwork) =>
    artworkMatchesSelection(artwork, selection, exclude),
  );
}

export function getAvailableFacetValues(
  artworks: Artwork[],
  selection: CatalogFilterSelection,
  dimension: FilterDimension,
): string[] {
  return uniqueSorted(
    filterArtworksBySelection(artworks, selection, dimension).map((artwork) =>
      getArtworkField(artwork, dimension),
    ),
  );
}

function pruneValues(values: string[], available: string[]): string[] {
  const availableSet = new Set(available);
  return values.filter((value) => availableSet.has(value));
}

export function reconcileFilterSelection(
  artworks: Artwork[],
  selection: CatalogFilterSelection,
): CatalogFilterSelection {
  const categories = pruneValues(
    selection.categories,
    getAvailableFacetValues(artworks, selection, "category"),
  );
  const withCategories = { ...selection, categories };

  const subcategories = pruneValues(
    withCategories.subcategories,
    getAvailableFacetValues(artworks, withCategories, "subcategory"),
  );
  const withSubcategories = { ...withCategories, subcategories };

  const materials = pruneValues(
    withSubcategories.materials,
    getAvailableFacetValues(artworks, withSubcategories, "material"),
  );

  return {
    categories,
    subcategories,
    materials,
  };
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
): string | null {
  if (!subcategoryParam) {
    return null;
  }

  return getSubcategories(artworks).includes(subcategoryParam)
    ? subcategoryParam
    : null;
}

export function getActiveCategoryPill(
  categories: string[],
): string | null {
  return categories.length === 1 ? categories[0] : null;
}

export function getActiveSubcategoryPill(
  subcategories: string[],
): string | null {
  return subcategories.length === 1 ? subcategories[0] : null;
}
