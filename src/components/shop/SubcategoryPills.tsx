"use client";

import artworksData from "@/data/artworks.json";
import {
  getSubcategoriesForCategories,
} from "@/lib/catalog-filters";
import type { Artwork } from "@/types/artwork";

const artworks = artworksData as Artwork[];

interface SubcategoryPillsProps {
  selectedCategories: string[];
  activeSubcategory?: string | null;
  onSelect?: (subcategory: string | null) => void;
}

export function SubcategoryPills({
  selectedCategories,
  activeSubcategory = null,
  onSelect,
}: SubcategoryPillsProps) {
  const subcategories = getSubcategoriesForCategories(
    artworks,
    selectedCategories,
  );

  if (subcategories.length === 0) {
    return null;
  }

  return (
    <div className="subcategory-filter">
      <p className="eyebrow mb-4">Refine by Subcategory</p>
      <div className="subcategory-pills-scroll">
        <button
          type="button"
          onClick={() => onSelect?.(null)}
          className={`chip ${activeSubcategory === null ? "chip-active" : ""}`}
          aria-pressed={activeSubcategory === null}
        >
          All
        </button>

        {subcategories.map((subcategory) => {
          const isActive = activeSubcategory === subcategory;

          return (
            <button
              key={subcategory}
              type="button"
              onClick={() => onSelect?.(subcategory)}
              className={`chip ${isActive ? "chip-active" : ""}`}
              aria-pressed={isActive}
            >
              {subcategory}
            </button>
          );
        })}
      </div>
    </div>
  );
}
