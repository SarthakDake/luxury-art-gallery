import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import type { Artwork } from "@/types/artwork";

interface RelatedProductsProps {
  artworks: Artwork[];
  currentSlug: string;
}

export function RelatedProducts({
  artworks,
  currentSlug,
}: RelatedProductsProps) {
  const related = artworks
    .filter((artwork) => artwork.slug !== currentSlug)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <Reveal as="section" variant="slide-up" className="surface-section section-block">
      <div className="site-container">
        <div className="mb-10 space-y-3">
          <p className="eyebrow">You May Also Like</p>
          <h2 className="section-title">Related Works</h2>
        </div>

        <div className="product-grid" data-reveal-stagger>
          {related.map((artwork) => (
            <ProductCard key={artwork.id} artwork={artwork} reveal />
          ))}
        </div>
      </div>
    </Reveal>
  );
}
