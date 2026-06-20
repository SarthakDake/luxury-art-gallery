"use client";

interface SubcategoryPillsProps {
  subcategories: string[];
  activeSubcategory?: string | null;
  onSelect?: (subcategory: string | null) => void;
}

function chipClassName(isActive: boolean) {
  return isActive
    ? "chip chip--selected !border-[#171717] !bg-[#171717] !text-white dark:!border-[#e5e5e5] dark:!bg-[#e5e5e5] dark:!text-[#111111]"
    : "chip";
}

export function SubcategoryPills({
  subcategories,
  activeSubcategory = null,
  onSelect,
}: SubcategoryPillsProps) {
  if (subcategories.length === 0) {
    return null;
  }

  function handleSelect(subcategory: string | null, target: HTMLButtonElement) {
    onSelect?.(subcategory);
    target.blur();
  }

  return (
    <div className="subcategory-filter">
      <p className="eyebrow mb-4">Refine by Subcategory</p>
      <div className="subcategory-pills-scroll">
        <button
          type="button"
          onClick={(event) => handleSelect(null, event.currentTarget)}
          className={chipClassName(activeSubcategory === null)}
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
              onClick={(event) => handleSelect(subcategory, event.currentTarget)}
              className={chipClassName(isActive)}
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
