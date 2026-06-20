"use client";

import { CategoryPills } from "@/components/shop/CategoryPills";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import artworksData from "@/data/artworks.json";
import type { Artwork } from "@/types/artwork";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const artworks = artworksData as Artwork[];

const categories = [...new Set(artworks.map((artwork) => artwork.category))].sort();
const materials = [...new Set(artworks.map((artwork) => artwork.material))].sort();

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function resolveCategoryFromParam(categoryParam: string | null): string | null {
  return categoryParam && categories.includes(categoryParam) ? categoryParam : null;
}

function ShopFilters({ categoryParam }: { categoryParam: string | null }) {
  const initialCategory = resolveCategoryFromParam(categoryParam);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    initialCategory ? [initialCategory] : [],
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [activeCategoryPill, setActiveCategoryPill] = useState<string | null>(
    () => initialCategory,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(artwork.category);
      const matchesMaterial =
        selectedMaterials.length === 0 ||
        selectedMaterials.includes(artwork.material);

      return matchesCategory && matchesMaterial;
    });
  }, [selectedCategories, selectedMaterials]);

  function handleCategoryPillSelect(category: string | null) {
    setActiveCategoryPill(category);
    setSelectedCategories(category ? [category] : []);
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
                  onChange={() => {
                    const next = toggleValue(selectedCategories, category);
                    setSelectedCategories(next);
                    setActiveCategoryPill(
                      next.length === 1
                        ? next[0]
                        : next.length === 0
                          ? null
                          : activeCategoryPill,
                    );
                  }}
                  className="filter-checkbox"
                />
                {category}
              </label>
            </li>
          ))}
        </ul>
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

      {(selectedCategories.length > 0 || selectedMaterials.length > 0) && (
        <button
          type="button"
          onClick={() => {
            setSelectedCategories([]);
            setSelectedMaterials([]);
            setActiveCategoryPill(null);
          }}
          className="btn-text"
        >
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
            Original paintings and sculptures. Refine by category or material to
            find the right piece for your space.
          </p>
        </Reveal>

        <Reveal variant="slide-up" className="mb-12">
          <CategoryPills
            activeCategory={activeCategoryPill}
            onSelect={handleCategoryPillSelect}
          />
        </Reveal>
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

  return <ShopFilters key={categoryParam ?? "all"} categoryParam={categoryParam} />;
}
