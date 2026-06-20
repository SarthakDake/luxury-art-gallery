"use client";

import { CategoryPills } from "@/components/shop/CategoryPills";
import { SubcategoryPills } from "@/components/shop/SubcategoryPills";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  filterArtworksBySelection,
  getActiveCategoryPill,
  getActiveSubcategoryPill,
  getAvailableFacetValues,
  getCategories,
  reconcileFilterSelection,
  resolveCategoryFromParam,
  resolveSubcategoryFromParam,
  type CatalogFilterSelection,
} from "@/lib/catalog-filters";
import type { Artwork } from "@/types/artwork";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function ShopFilters({
  artworks,
  categoryParam,
  subcategoryParam,
}: {
  artworks: Artwork[];
  categoryParam: string | null;
  subcategoryParam: string | null;
}) {
  const categories = getCategories(artworks);
  const initialCategory = resolveCategoryFromParam(categoryParam, categories);
  const initialSubcategory = resolveSubcategoryFromParam(
    subcategoryParam,
    artworks,
  );
  const initialSelection: CatalogFilterSelection = {
    categories: initialCategory ? [initialCategory] : [],
    subcategories: initialSubcategory ? [initialSubcategory] : [],
    materials: [],
  };

  const [selection, setSelection] = useState<CatalogFilterSelection>(() =>
    reconcileFilterSelection(artworks, initialSelection),
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const subcategoryPillsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  function isMobileViewport() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
    );
  }

  function getStickyTopOffset() {
    if (typeof window === "undefined") {
      return 80;
    }

    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--sticky-top")
      .trim();

    if (value.endsWith("px")) {
      return Number.parseFloat(value) || 80;
    }

    return 80;
  }

  type MobileScrollMode = "subcategory" | "results-preview" | "results-full";

  function scrollToMobileTarget(
    element: HTMLElement | null,
    mode: MobileScrollMode,
    behavior: ScrollBehavior = "smooth",
  ) {
    if (!element || !isMobileViewport()) {
      return;
    }

    const stickyTop = getStickyTopOffset();
    const rect = element.getBoundingClientRect();

    let offsetFromTop = stickyTop + 8;

    if (mode === "subcategory") {
      offsetFromTop = stickyTop + 12;
    }

    if (mode === "results-preview") {
      offsetFromTop = window.innerHeight * 0.4;
    }

    const top = window.scrollY + rect.top - offsetFromTop;
    window.scrollTo({ top: Math.max(0, top), behavior });
  }

  function scrollToSubcategoryFilters(behavior: ScrollBehavior = "smooth") {
    if (subcategoryPillsRef.current) {
      scrollToMobileTarget(subcategoryPillsRef.current, "subcategory", behavior);
      return;
    }

    scrollToResultsPreview(behavior);
  }

  function scrollToResultsPreview(behavior: ScrollBehavior = "smooth") {
    scrollToMobileTarget(resultsRef.current, "results-preview", behavior);
  }

  function scrollToResultsFull(behavior: ScrollBehavior = "smooth") {
    scrollToMobileTarget(resultsRef.current, "results-full", behavior);
  }

  function runMobileScroll(action: () => void) {
    if (!isMobileViewport()) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(action);
    });
  }

  function closeMobileFiltersPanel() {
    setFiltersOpen(false);
  }

  const { categories: selectedCategories, subcategories: selectedSubcategories, materials: selectedMaterials } =
    selection;

  const availableCategories = useMemo(
    () => getAvailableFacetValues(artworks, selection, "category"),
    [artworks, selection],
  );

  const availableSubcategories = useMemo(
    () => getAvailableFacetValues(artworks, selection, "subcategory"),
    [artworks, selection],
  );

  const availableMaterials = useMemo(
    () => getAvailableFacetValues(artworks, selection, "material"),
    [artworks, selection],
  );

  const filteredArtworks = useMemo(
    () => filterArtworksBySelection(artworks, selection),
    [artworks, selection],
  );

  const activeCategoryPill = getActiveCategoryPill(selectedCategories);
  const activeSubcategoryPill = getActiveSubcategoryPill(selectedSubcategories);

  function applySelection(nextSelection: CatalogFilterSelection) {
    setSelection(reconcileFilterSelection(artworks, nextSelection));
  }

  function handleCategoryPillSelect(category: string | null) {
    applySelection({
      ...selection,
      categories: category ? [category] : [],
    });

    runMobileScroll(() => {
      if (category) {
        scrollToSubcategoryFilters();
        return;
      }

      scrollToResultsFull();
    });
  }

  function handleSubcategoryPillSelect(subcategory: string | null) {
    applySelection({
      ...selection,
      subcategories: subcategory ? [subcategory] : [],
    });

    runMobileScroll(() => {
      if (subcategory) {
        scrollToResultsPreview();
        return;
      }

      scrollToResultsFull();
    });
  }

  function handleCategoryCheckboxToggle(category: string) {
    const isSelecting = !selectedCategories.includes(category);

    applySelection({
      ...selection,
      categories: toggleValue(selectedCategories, category),
    });
    closeMobileFiltersPanel();

    runMobileScroll(() => {
      if (isSelecting) {
        scrollToSubcategoryFilters();
        return;
      }

      scrollToResultsFull();
    });
  }

  function handleSubcategoryCheckboxToggle(subcategory: string) {
    const isSelecting = !selectedSubcategories.includes(subcategory);

    applySelection({
      ...selection,
      subcategories: toggleValue(selectedSubcategories, subcategory),
    });
    closeMobileFiltersPanel();

    runMobileScroll(() => {
      if (isSelecting) {
        scrollToResultsPreview();
        return;
      }

      scrollToResultsFull();
    });
  }

  function handleMaterialCheckboxToggle(material: string) {
    applySelection({
      ...selection,
      materials: toggleValue(selectedMaterials, material),
    });
    closeMobileFiltersPanel();

    runMobileScroll(scrollToResultsFull);
  }

  function handleClearFilters() {
    setSelection({
      categories: [],
      subcategories: [],
      materials: [],
    });
    setFiltersOpen(false);

    runMobileScroll(scrollToResultsFull);
  }

  const activeFilterCount =
    selectedCategories.length +
    selectedSubcategories.length +
    selectedMaterials.length;

  const resultsSummary =
    filteredArtworks.length === 1
      ? "1 work"
      : `${filteredArtworks.length} works`;

  const filterSidebar = (
    <aside className="card-panel space-y-8 p-6 lg:p-8">
      <div>
        <h2 className="eyebrow mb-5">Category</h2>
        <ul className="filter-list">
          {categories.map((category) => {
            const isChecked = selectedCategories.includes(category);
            const isAvailable = availableCategories.includes(category);

            return (
              <li key={category}>
                <label
                  className={`filter-label${isAvailable || isChecked ? "" : " filter-label-disabled"}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={!isAvailable && !isChecked}
                    onChange={() => handleCategoryCheckboxToggle(category)}
                    className="filter-checkbox"
                  />
                  {category}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2 className="eyebrow mb-5">Subcategory</h2>
        {availableSubcategories.length > 0 ? (
          <ul className="filter-list">
            {availableSubcategories.map((subcategory) => {
              const isChecked = selectedSubcategories.includes(subcategory);

              return (
                <li key={subcategory}>
                  <label className="filter-label">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleSubcategoryCheckboxToggle(subcategory)}
                      className="filter-checkbox"
                    />
                    {subcategory}
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="filter-helper-text">No subcategories match your filters.</p>
        )}
      </div>

      <div>
        <h2 className="eyebrow mb-5">Material</h2>
        {availableMaterials.length > 0 ? (
          <ul className="filter-list">
            {availableMaterials.map((material) => {
              const isChecked = selectedMaterials.includes(material);

              return (
                <li key={material}>
                  <label className="filter-label">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleMaterialCheckboxToggle(material)}
                      className="filter-checkbox"
                    />
                    {material}
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="filter-helper-text">No materials match your filters.</p>
        )}
      </div>

      {activeFilterCount > 0 && (
        <button type="button" onClick={handleClearFilters} className="btn-text">
          Clear filters
        </button>
      )}

      <div className="shop-mobile-filter-actions lg:hidden">
        <button
          type="button"
          onClick={() => {
            closeMobileFiltersPanel();
            runMobileScroll(scrollToResultsFull);
          }}
          className="btn-primary btn-block"
        >
          View {resultsSummary}
        </button>
      </div>
    </aside>
  );

  return (
    <div>
      <div className="site-container page-shell page-section-end shop-page-shell">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Gallery" },
          ]}
        />

        <Reveal as="header" variant="slide-up" className="mb-6 space-y-3">
          <h1 className="page-title">All Arts</h1>
          <p className="body-text max-w-2xl">
            Original paintings and sculptures. Refine by category, subcategory,
            or material to find the right piece for your space.
          </p>
        </Reveal>

        <Reveal variant="slide-up" className="mb-6">
          <CategoryPills
            artworks={artworks}
            activeCategory={activeCategoryPill}
            onSelect={handleCategoryPillSelect}
          />
        </Reveal>

        {availableSubcategories.length > 0 ? (
          <Reveal variant="slide-up">
            <div ref={subcategoryPillsRef}>
              <SubcategoryPills
                subcategories={availableSubcategories}
                activeSubcategory={activeSubcategoryPill}
                onSelect={handleSubcategoryPillSelect}
              />
            </div>
          </Reveal>
        ) : null}
      </div>

      <div className="surface-section section-block shop-catalog-block">
        <div className="site-container">
          <div className="shop-mobile-results-bar lg:hidden">
            <p className="shop-mobile-results-count">{resultsSummary}</p>
            <p className="shop-mobile-results-meta">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} applied`
                : "Works appear below"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="btn-ghost btn-block mb-6 lg:hidden"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </button>

          <div className="shop-catalog-grid">
            <div
              className={`shop-filters-column transition-all duration-300 lg:block ${
                filtersOpen
                  ? "block opacity-100"
                  : "hidden opacity-0 lg:opacity-100"
              }`}
            >
              {filterSidebar}
            </div>

            <div
              ref={resultsRef}
              className="shop-results-column shop-results-anchor"
            >
              <p className="mb-6 meta-text hidden lg:block">
                {filteredArtworks.length}{" "}
                {filteredArtworks.length === 1 ? "work" : "works"}
              </p>

              {filteredArtworks.length > 0 ? (
                <div className="product-grid shop-product-grid" data-reveal-stagger>
                  {filteredArtworks.map((artwork) => (
                    <ProductCard key={artwork.id} artwork={artwork} reveal />
                  ))}
                </div>
              ) : (
                <div className="card-panel px-6 py-20 text-center">
                  <p className="section-title mb-4">No works match your filters</p>
                  <p className="body-text">
                    Try adjusting your selections to see more of the collection.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPageContent({ artworks }: { artworks: Artwork[] }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");

  return (
    <ShopFilters
      key={`${categoryParam ?? "all"}-${subcategoryParam ?? "all"}`}
      artworks={artworks}
      categoryParam={categoryParam}
      subcategoryParam={subcategoryParam}
    />
  );
}
