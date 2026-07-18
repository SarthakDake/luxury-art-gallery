import { Reveal } from "@/components/motion/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { selectCuratedArtworks } from "@/lib/curated-artworks";
import type { Artwork } from "@/types/artwork";
import type { CuratedWorksCopy } from "@/types/site-config";
import type { ReactNode } from "react";

export function CuratedCollectionPage({
  copy,
  artworks,
  breadcrumbLabel,
  intro,
  emptyMessage = "Works for this collection will appear here soon.",
}: {
  copy: CuratedWorksCopy;
  artworks: Artwork[];
  breadcrumbLabel: string;
  intro?: ReactNode;
  emptyMessage?: string;
}) {
  const curated = selectCuratedArtworks(artworks, {
    limit: Math.max(copy.limit, 12),
    categoryFilter: copy.categoryFilter,
  });

  return (
    <div className="site-container page-shell page-section-end">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: breadcrumbLabel },
        ]}
      />

      <Reveal as="header" variant="slide-up" className="about-intro">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="page-title">{copy.title}</h1>
        {copy.subtitle ? (
          <p className="body-text max-w-2xl">{copy.subtitle}</p>
        ) : null}
      </Reveal>

      {intro}

      {curated.length > 0 ? (
        <Reveal
          as="section"
          variant="slide-up"
          className="section-block"
          aria-label={copy.title}
        >
          <div className="product-grid" data-reveal-stagger>
            {curated.map((artwork) => (
              <ProductCard key={artwork.id} artwork={artwork} reveal />
            ))}
          </div>
        </Reveal>
      ) : (
        <p className="body-text text-[var(--muted)]">{emptyMessage}</p>
      )}
    </div>
  );
}
