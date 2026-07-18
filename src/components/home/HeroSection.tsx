import { Reveal } from "@/components/motion/Reveal";
import { SiteBrandName } from "@/components/ui/SiteBrandName";
import { SoftImage } from "@/components/ui/SoftImage";
import { getArtworkImageSrc } from "@/lib/artwork-image";
import type { SiteConfig } from "@/types/site-config";
import Link from "next/link";

const FALLBACK_HERO_IMAGE = "/hero-banner.jpg";

export function HeroSection({ config }: { config: SiteConfig }) {
  const { hero } = config.homepage;
  const heroImageUrl = hero.imageUrl?.trim() || FALLBACK_HERO_IMAGE;
  const hasHeroImage = Boolean(heroImageUrl);
  const resolvedHeroSrc = getArtworkImageSrc(heroImageUrl);

  return (
    <section className={`hero-block ${hasHeroImage ? "hero-block--image" : ""}`}>
      {hasHeroImage ? (
        <>
          <SoftImage
            src={resolvedHeroSrc}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="hero-media object-cover"
          />
          <div className="hero-overlay" aria-hidden />
        </>
      ) : null}

      <div className="site-container hero-inner">
        <div className="hero-content">
          <Reveal as="div" variant="fade-in" immediate delay={0} className="hero-brand">
            <SiteBrandName name={config.siteName} />
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
            <Link href={hero.primaryCtaHref} className="btn-primary btn-responsive">
              {hero.primaryCtaLabel}
            </Link>
            <Link href={hero.secondaryCtaHref} className="btn-secondary btn-responsive">
              {hero.secondaryCtaLabel}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
