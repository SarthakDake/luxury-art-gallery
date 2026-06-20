"use client";

import artworksData from "@/data/artworks.json";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import type { Artwork } from "@/types/artwork";
import Link from "next/link";

const artworks = artworksData as Artwork[];

interface CategoryPillsProps {
  activeCategory?: string | null;
  onSelect?: (category: string | null) => void;
  linkMode?: boolean;
}

export function CategoryPills({
  activeCategory = null,
  onSelect,
  linkMode = false,
}: CategoryPillsProps) {
  const categories = [...new Set(artworks.map((artwork) => artwork.category))];

  const categoryImages = categories.reduce<Record<string, string>>(
    (accumulator, category) => {
      const artwork = artworks.find((item) => item.category === category);
      if (artwork) accumulator[category] = artwork.imageUrl;
      return accumulator;
    },
    {},
  );

  const allPillContent = (
    <>
      <span
        className={`category-pill-frame ${
          !linkMode && activeCategory === null ? "category-pill-frame-active" : ""
        }`}
      >
        <span className="category-pill-all-text">All</span>
      </span>
      <span className="category-pill-label">All Artworks</span>
    </>
  );

  return (
    <div className="category-pills-scroll">
      {linkMode ? (
        <Link href="/shop" className="category-pill" aria-label="Browse all art works">
          {allPillContent}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onSelect?.(null)}
          className="category-pill"
          aria-label="Show all art works"
        >
          {allPillContent}
        </button>
      )}

      {categories.map((category) => {
        const isActive = activeCategory === category;
        const imageUrl = categoryImages[category];

        const frame = (
          <span
            className={`category-pill-frame ${
              isActive ? "category-pill-frame-active" : ""
            }`}
          >
            {imageUrl && (
              <ArtworkImage
                src={imageUrl}
                alt=""
                fill
                sizes="112px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </span>
        );

        const label = (
          <span
            className={`category-pill-label ${
              isActive ? "" : "category-pill-label-muted"
            }`}
          >
            {category}
          </span>
        );

        if (linkMode) {
          return (
            <Link
              key={category}
              href={`/shop?category=${encodeURIComponent(category)}`}
              className="category-pill group"
              aria-label={`Browse ${category}`}
            >
              {frame}
              {label}
            </Link>
          );
        }

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect?.(category)}
            className="category-pill group"
            aria-label={`Filter by ${category}`}
          >
            {frame}
            {label}
          </button>
        );
      })}
    </div>
  );
}
