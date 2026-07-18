import { Reveal } from "@/components/motion/Reveal";
import { SoftImage } from "@/components/ui/SoftImage";
import type { SiteConfig } from "@/types/site-config";
import Link from "next/link";

/** Static public asset — avoid `fs` so hero can render in client-side studio previews. */
const HAS_HERO_IMAGE = true;

export function HeroSection({ config }: { config: SiteConfig }) {
  const { hero } = config.homepage;

  return (
    <section className={`hero-block ${HAS_HERO_IMAGE ? "hero-block--image" : ""}`}>
      {HAS_HERO_IMAGE ? (
        <>
          <SoftImage
            src="/hero-banner.jpg"
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
            className={`hero-actions ${HAS_HERO_IMAGE ? "hero-actions--on-dark" : ""}`}
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
