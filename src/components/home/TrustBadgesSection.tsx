import { Reveal } from "@/components/motion/Reveal";
import { TrustBadges } from "@/components/ui/TrustBadges";
import type { SiteConfig } from "@/types/site-config";

export function TrustBadgesSection({ config }: { config: SiteConfig }) {
  if (config.trustBadges.length === 0) {
    return null;
  }

  return (
    <Reveal as="section" variant="slide-up" className="site-container content-band content-band--compact">
      <TrustBadges config={config} />
    </Reveal>
  );
}
