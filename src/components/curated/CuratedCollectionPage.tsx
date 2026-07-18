import { Reveal } from "@/components/motion/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { selectCuratedArtworks } from "@/lib/curated-artworks";
import { DEFAULT_HOMEPAGE } from "@/lib/site-config/defaults";
import type { Artwork } from "@/types/artwork";
import type { CuratedWorksCopy } from "@/types/site-config";
import type { ReactNode } from "react";

export function CuratedCollectionPage({
  copy,
  artworks,
  breadcrumbLabel,
  intro,
  emptyMessage = "Works for this collection will appear here soon.",
  fallbackCopy = DEFAULT_HOMEPAGE.signatureWallArt,
}: {
  copy: CuratedWorksCopy | undefined;
  artworks: Artwork[];
  breadcrumbLabel: string;
  intro?: ReactNode;
  emptyMessage?: string;
  fallbackCopy?: CuratedWorksCopy;
}) {
  const resolved = copy ?? fallbackCopy;
  const curated = selectCuratedArtworks(artworks, {
    limit: Math.max(resolved.limit, 12),
    categoryFilter: resolved.categoryFilter,
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
        <p className="eyebrow">{resolved.eyebrow}</p>
        <h1 className="page-title">{resolved.title}</h1>
        {resolved.subtitle ? (
          <p className="body-text max-w-2xl">{resolved.subtitle}</p>
        ) : null}
      </Reveal>

      {intro}

      {curated.length > 0 ? (
        <Reveal
          as="section"
          variant="slide-up"
          className="section-block"
          aria-label={resolved.title}
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
