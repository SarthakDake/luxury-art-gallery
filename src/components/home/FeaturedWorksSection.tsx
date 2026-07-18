import { Reveal } from "@/components/motion/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Artwork } from "@/types/artwork";
import type { SiteConfig } from "@/types/site-config";
import Link from "next/link";

export function FeaturedWorksSection({
  config,
  artworks,
}: {
  config: SiteConfig;
  artworks: Artwork[];
}) {
  const copy = config.homepage.featured;
  const featuredArtworks = artworks.slice(0, copy.limit);

  if (featuredArtworks.length === 0) {
    return null;
  }

  return (
    <Reveal as="section" variant="slide-up" className="site-container section-block section-divider-top">
      <div className="section-header mb-10">
        <div className="section-header-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
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
        {featuredArtworks.map((artwork) => (
          <ProductCard key={artwork.id} artwork={artwork} reveal />
        ))}
      </div>
    </Reveal>
  );
}
