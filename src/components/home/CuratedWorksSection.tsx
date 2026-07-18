import { Reveal } from "@/components/motion/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { selectCuratedArtworks } from "@/lib/curated-artworks";
import type { Artwork } from "@/types/artwork";
import type { CuratedWorksCopy } from "@/types/site-config";
import Link from "next/link";

export function CuratedWorksSection({
  copy,
  artworks,
}: {
  copy: CuratedWorksCopy;
  artworks: Artwork[];
}) {
  const curated = selectCuratedArtworks(artworks, {
    limit: copy.limit,
    categoryFilter: copy.categoryFilter,
  });

  if (curated.length === 0) {
    return null;
  }

  return (
    <Reveal
      as="section"
      variant="slide-up"
      className="site-container section-block section-divider-top"
    >
      <div className="section-header mb-10">
        <div className="section-header-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
          {copy.subtitle ? (
            <p className="body-text mt-3 max-w-2xl">{copy.subtitle}</p>
          ) : null}
        </div>
        {copy.actionHref && copy.actionLabel ? (
          <Link
            href={copy.actionHref}
            className="btn-secondary btn-responsive section-header-action"
          >
            {copy.actionLabel}
          </Link>
        ) : null}
      </div>

      <div className="product-grid" data-reveal-stagger>
        {curated.map((artwork) => (
          <ProductCard key={artwork.id} artwork={artwork} reveal />
        ))}
      </div>
    </Reveal>
  );
}
