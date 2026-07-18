import { CollectionsSection } from "@/components/home/CollectionsSection";
import { FeaturedWorksSection } from "@/components/home/FeaturedWorksSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { OffersSection } from "@/components/home/OffersSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustBadgesSection } from "@/components/home/TrustBadgesSection";
import { getEnabledHomepageSections } from "@/lib/site-config";
import type { Artwork } from "@/types/artwork";
import type { HomepageSectionId, SiteConfig } from "@/types/site-config";

function renderSection(
  id: HomepageSectionId,
  config: SiteConfig,
  artworks: Artwork[],
) {
  switch (id) {
    case "hero":
      return <HeroSection key={id} config={config} />;
    case "trustBadges":
      return <TrustBadgesSection key={id} config={config} />;
    case "collections":
      return <CollectionsSection key={id} config={config} artworks={artworks} />;
    case "featured":
      return <FeaturedWorksSection key={id} config={config} artworks={artworks} />;
    case "offers":
      return <OffersSection key={id} config={config} />;
    case "features":
      return <FeaturesSection key={id} config={config} />;
    case "testimonials":
      return <TestimonialsSection key={id} config={config} />;
    default:
      return null;
  }
}

/**
 * Config-driven homepage: section order and visibility come from SiteConfig.
 * New capabilities stay gated by `features.*` flags in config.json.
 */
export function HomeSections({
  config,
  artworks,
}: {
  config: SiteConfig;
  artworks: Artwork[];
}) {
  const sections = getEnabledHomepageSections(config);

  return <>{sections.map((id) => renderSection(id, config, artworks))}</>;
}
