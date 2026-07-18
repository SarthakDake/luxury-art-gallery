import { Reveal } from "@/components/motion/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { SoftImage } from "@/components/ui/SoftImage";
import { getArtworkImageSrc } from "@/lib/artwork-image";
import { selectCuratedArtworks } from "@/lib/curated-artworks";
import { DEFAULT_HOMEPAGE } from "@/lib/site-config/defaults";
import type { Artwork } from "@/types/artwork";
import type { CuratedWorksCopy } from "@/types/site-config";
import Link from "next/link";

export function SignatureWallArtView({
  copy,
  artworks,
}: {
  copy: CuratedWorksCopy | undefined;
  artworks: Artwork[];
}) {
  const resolved = copy ?? DEFAULT_HOMEPAGE.signatureWallArt;
  const pageImage = resolved.pageImageUrl.trim();
  const intro = resolved.pageIntro.trim() || resolved.subtitle.trim();
  const pageLimit = Math.max(1, resolved.pageLimit || 6);
  const curated = selectCuratedArtworks(artworks, {
    limit: pageLimit,
    categoryFilter: resolved.categoryFilter,
  });

  return (
    <>
      <section
        className={`signature-page-hero ${pageImage ? "signature-page-hero--image" : ""}`}
        aria-label={resolved.title}
      >
        {pageImage ? (
          <SoftImage
            src={getArtworkImageSrc(pageImage)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="signature-page-hero-media object-cover"
          />
        ) : (
          <div className="signature-page-hero-fallback" aria-hidden />
        )}
      </section>

      <div className="site-container page-shell page-section-end">
        <Reveal as="header" variant="slide-up" className="signature-page-intro">
          <p className="eyebrow">{resolved.eyebrow}</p>
          <h1 className="page-title">{resolved.title}</h1>
          {intro ? <p className="body-text signature-page-intro-copy">{intro}</p> : null}
        </Reveal>

        {curated.length > 0 ? (
          <Reveal
            as="section"
            variant="slide-up"
            className="signature-page-grid-section"
            aria-label="Premium projects"
          >
            <div className="product-grid signature-page-grid" data-reveal-stagger>
              {curated.map((artwork) => (
                <ProductCard key={artwork.id} artwork={artwork} reveal />
              ))}
            </div>
          </Reveal>
        ) : (
          <p className="body-text text-[var(--muted)]">
            Signature projects will appear here soon.
          </p>
        )}

        {resolved.pageCtaLabel && resolved.pageCtaHref ? (
          <Reveal variant="fade-in" className="signature-page-cta">
            <Link
              href={resolved.pageCtaHref}
              className="btn-primary btn-responsive"
            >
              {resolved.pageCtaLabel}
            </Link>
          </Reveal>
        ) : null}
      </div>
    </>
  );
}
