"use client";

import type { ArtworkSize } from "@/types/artwork";

interface SizeSelectorProps {
  sizes: ArtworkSize[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SizeSelector({
  sizes,
  selectedIndex,
  onSelect,
}: SizeSelectorProps) {
  return (
    <div className="space-y-4">
      <label htmlFor="size-select" className="field-label">
        Size
      </label>

      <select
        id="size-select"
        value={selectedIndex}
        onChange={(event) => onSelect(Number(event.target.value))}
        className="select-field md:hidden"
      >
        {sizes.map((size, index) => (
          <option key={size.size} value={index}>
            {size.size}
          </option>
        ))}
      </select>

      <div
        className="hidden flex-wrap gap-3 md:flex"
        role="radiogroup"
        aria-label="Select size"
      >
        {sizes.map((size, index) => {
          const isSelected = selectedIndex === index;

          return (
            <button
              key={size.size}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(index)}
              className={`size-pill ${isSelected ? "size-pill-active" : ""}`}
            >
              {size.size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
