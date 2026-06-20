"use client";

import { CategoryPills } from "@/components/shop/CategoryPills";
import { SubcategoryPills } from "@/components/shop/SubcategoryPills";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import artworksData from "@/data/artworks.json";
import {
  getCategories,
  getMaterials,
  getSubcategoriesForCategories,
  pruneSubcategories,
  resolveCategoryFromParam,
  resolveSubcategoryFromParam,
} from "@/lib/catalog-filters";
import type { Artwork } from "@/types/artwork";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const artworks = artworksData as Artwork[];
const categories = getCategories(artworks);
const materials = getMaterials(artworks);

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function ShopFilters({
  categoryParam,
  subcategoryParam,
}: {
  categoryParam: string | null;
  subcategoryParam: string | null;
}) {
  const initialCategory = resolveCategoryFromParam(categoryParam, categories);
  const initialCategories = initialCategory ? [initialCategory] : [];
  const initialSubcategory = resolveSubcategoryFromParam(
    subcategoryParam,
    artworks,
    initialCategories,
  );

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initialCategories);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    () => (initialSubcategory ? [initialSubcategory] : []),
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [activeCategoryPill, setActiveCategoryPill] = useState<string | null>(
    () => initialCategory,
  );
  const [activeSubcategoryPill, setActiveSubcategoryPill] = useState<
    string | null
  >(() => initialSubcategory);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableSubcategories = useMemo(
    () => getSubcategoriesForCategories(artworks, selectedCategories),
    [selectedCategories],
  );

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(artwork.category);
      const matchesSubcategory =
        selectedSubcategories.length === 0 ||
        selectedSubcategories.includes(artwork.subcategory);
      const matchesMaterial =
        selectedMaterials.length === 0 ||
        selectedMaterials.includes(artwork.material);

      return matchesCategory && matchesSubcategory && matchesMaterial;
    });
  }, [selectedCategories, selectedSubcategories, selectedMaterials]);

  function syncSubcategories(nextCategories: string[]) {
    setSelectedSubcategories((current) =>
      pruneSubcategories(artworks, nextCategories, current),
    );

    setActiveSubcategoryPill((current) => {
      if (!current) return null;
      const available = getSubcategoriesForCategories(artworks, nextCategories);
      return available.includes(current) ? current : null;
    });
  }

  function handleCategoryPillSelect(category: string | null) {
    setActiveCategoryPill(category);
    const nextCategories = category ? [category] : [];
    setSelectedCategories(nextCategories);
    setSelectedSubcategories([]);
    setActiveSubcategoryPill(null);
  }

  function handleSubcategoryPillSelect(subcategory: string | null) {
    setActiveSubcategoryPill(subcategory);
    setSelectedSubcategories(subcategory ? [subcategory] : []);
  }

  function handleCategoryCheckboxToggle(category: string) {
    const next = toggleValue(selectedCategories, category);
    setSelectedCategories(next);
    syncSubcategories(next);
    setActiveCategoryPill(
      next.length === 1 ? next[0] : next.length === 0 ? null : activeCategoryPill,
    );
  }

  function handleSubcategoryCheckboxToggle(subcategory: string) {
    setSelectedSubcategories((current) => {
      const next = toggleValue(current, subcategory);
      setActiveSubcategoryPill(next.length === 1 ? next[0] : null);
      return next;
    });
  }

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedMaterials([]);
    setActiveCategoryPill(null);
    setActiveSubcategoryPill(null);
  }

  const filterSidebar = (
    <aside className="card-panel space-y-8 p-6 lg:p-8">
      <div>
        <h2 className="eyebrow mb-5">Category</h2>
        <ul className="filter-list">
          {categories.map((category) => (
            <li key={category}>
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryCheckboxToggle(category)}
                  className="filter-checkbox"
                />
                {category}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={
          availableSubcategories.length > 0
            ? undefined
            : "filter-section-disabled"
        }
      >
        <h2 className="eyebrow mb-5">Subcategory</h2>
        {availableSubcategories.length > 0 ? (
          <ul className="filter-list">
            {availableSubcategories.map((subcategory) => (
              <li key={subcategory}>
                <label className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedSubcategories.includes(subcategory)}
                    onChange={() => handleSubcategoryCheckboxToggle(subcategory)}
                    className="filter-checkbox"
                  />
                  {subcategory}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="filter-helper-text">
            Select a category to browse subcategories.
          </p>
        )}
      </div>

      <div>
        <h2 className="eyebrow mb-5">Material</h2>
        <ul className="filter-list">
          {materials.map((material) => (
            <li key={material}>
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(material)}
                  onChange={() =>
                    setSelectedMaterials((current) =>
                      toggleValue(current, material),
                    )
                  }
                  className="filter-checkbox"
                />
                {material}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {(selectedCategories.length > 0 ||
        selectedSubcategories.length > 0 ||
        selectedMaterials.length > 0) && (
        <button type="button" onClick={clearFilters} className="btn-text">
          Clear filters
        </button>
      )}
    </aside>
  );

  return (
    <div>
      <div className="site-container page-shell page-section-end">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Gallery" },
          ]}
        />

        <Reveal as="header" variant="slide-up" className="mb-10 space-y-4">
          <h1 className="page-title">All Arts</h1>
          <p className="body-text max-w-2xl">
            Original paintings and sculptures. Refine by category, subcategory,
            or material to find the right piece for your space.
          </p>
        </Reveal>

        <Reveal variant="slide-up" className="mb-8">
          <CategoryPills
            activeCategory={activeCategoryPill}
            onSelect={handleCategoryPillSelect}
          />
        </Reveal>

        {selectedCategories.length > 0 ? (
          <Reveal variant="slide-up" className="mb-12">
            <SubcategoryPills
              selectedCategories={selectedCategories}
              activeSubcategory={activeSubcategoryPill}
              onSelect={handleSubcategoryPillSelect}
            />
          </Reveal>
        ) : (
          <div className="mb-12" />
        )}
      </div>

      <div className="surface-section section-block">
        <div className="site-container">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="btn-ghost btn-block mb-8 lg:hidden"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </button>

          <div className="shop-catalog-grid">
            <div
              className={`transition-all duration-300 lg:block ${
                filtersOpen
                  ? "mb-4 block opacity-100"
                  : "hidden opacity-0 lg:opacity-100"
              }`}
            >
              {filterSidebar}
            </div>

            <Reveal variant="slide-up">
              <p className="mb-8 meta-text">
                {filteredArtworks.length}{" "}
                {filteredArtworks.length === 1 ? "work" : "works"}
              </p>

              {filteredArtworks.length > 0 ? (
                <div className="product-grid" data-reveal-stagger>
                  {filteredArtworks.map((artwork) => (
                    <ProductCard key={artwork.id} artwork={artwork} reveal />
                  ))}
                </div>
              ) : (
                <div className="card-panel px-6 py-20 text-center" data-reveal="fade-in">
                  <p className="section-title mb-4">No works match your filters</p>
                  <p className="body-text">
                    Try adjusting your selections to see more of the collection.
                  </p>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");

  return (
    <ShopFilters
      key={`${categoryParam ?? "all"}-${subcategoryParam ?? "all"}`}
      categoryParam={categoryParam}
      subcategoryParam={subcategoryParam}
    />
  );
}
