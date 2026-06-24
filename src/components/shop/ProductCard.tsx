import { formatPriceFrom, isShowcaseOnly, type Artwork } from "@/types/artwork";
import { ArtworkImage } from "@/components/ui/ArtworkImage";
import Link from "next/link";

interface ProductCardProps {
  artwork: Artwork;
  reveal?: boolean;
}

export function ProductCard({ artwork, reveal = false }: ProductCardProps) {
  const showcaseOnly = isShowcaseOnly(artwork);

  return (
    <Link
      href={`/art/${artwork.slug}`}
      scroll={false}
      className="product-card-link group"
      {...(reveal ? { "data-reveal": "scale-in" } : {})}
    >
      <article className="space-y-4">
        <div className="art-image-frame">
          <ArtworkImage
            src={artwork.imageUrl}
            alt={artwork.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
            {!artwork.inStock && !showcaseOnly && (
              <span className="sold-out-badge">Sold Out</span>
            )}
        </div>

        <div className="space-y-2">
          <p className="eyebrow">{artwork.category}</p>
          <h3 className="font-serif text-lg leading-snug tracking-wide text-[var(--foreground)] transition-colors duration-300 group-hover:text-[var(--muted)]">
            {artwork.title}
          </h3>
          {!showcaseOnly ? (
            <p className="text-sm font-medium tracking-wide text-[var(--foreground)]">
              {formatPriceFrom(artwork)}
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
