import { CategoryPills } from "@/components/shop/CategoryPills";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { getArtworks, getSiteConfig } from "@/lib/site-data";
import fs from "fs";
import Link from "next/link";
import path from "path";

const heroImagePath = path.join(process.cwd(), "public/hero-banner.jpg");
const hasHeroImage = fs.existsSync(heroImagePath);

export default function Home() {
  const config = getSiteConfig();
  const artworks = getArtworks();
  const featuredArtworks = artworks.slice(0, 4);
  return (
    <>
      <section
        className={`hero-block ${hasHeroImage ? "hero-block--image" : ""}`}
        style={
          hasHeroImage
            ? { backgroundImage: "url(/hero-banner.jpg)" }
            : undefined
        }
      >
        {hasHeroImage && <div className="hero-overlay" aria-hidden />}

        <div className="site-container hero-inner">
          <div className="hero-content">
            <Reveal as="p" variant="fade-in" immediate delay={0} className="hero-eyebrow">
              {config.siteName}
            </Reveal>
            <Reveal as="h1" variant="slide-up" immediate delay={100} className="hero-title">
              {config.heroTitle}
            </Reveal>
            <Reveal as="p" variant="slide-up" immediate delay={180} className="hero-subtitle">
              {config.heroSubtitle}
            </Reveal>

            <Reveal
              variant="slide-up"
              immediate
              delay={260}
              className={`hero-actions ${hasHeroImage ? "hero-actions--on-dark" : ""}`}
            >
              <Link href="/shop" className="btn-primary btn-responsive">
                Shop Gallery
              </Link>
              <Link href="/about" className="btn-secondary btn-responsive">
                About the Artist
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <Reveal as="section" variant="slide-up" className="site-container content-band content-band--compact">
        <TrustBadges />
      </Reveal>

      <Reveal as="section" variant="slide-up" className="surface-section section-block">
        <div className="site-container space-y-8">
          <div className="section-header">
            <div className="section-header-copy">
              <p className="eyebrow">Browse by Medium</p>
              <h2 className="section-title">Collections</h2>
            </div>
            <Link href="/shop" className="btn-text section-header-action">
              View all
            </Link>
          </div>
          <CategoryPills linkMode artworks={artworks} />
        </div>
      </Reveal>

      <Reveal as="section" variant="slide-up" className="site-container section-block section-divider-top">
        <div className="section-header mb-10">
          <div className="section-header-copy">
            <p className="eyebrow">Featured Collection</p>
            <h2 className="section-title">Selected Works</h2>
          </div>
          <Link
            href="/shop"
            className="btn-secondary btn-responsive section-header-action"
          >
            View Full Gallery
          </Link>
        </div>

        <div className="product-grid" data-reveal-stagger>
          {featuredArtworks.map((artwork) => (
            <ProductCard key={artwork.id} artwork={artwork} reveal />
          ))}
        </div>
      </Reveal>
    </>
  );
}
