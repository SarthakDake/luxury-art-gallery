import { Reveal } from "@/components/motion/Reveal";
import type { SiteConfig } from "@/types/site-config";
import {
  Gem,
  Headphones,
  HeartHandshake,
  Palette,
  type LucideIcon,
} from "lucide-react";

const featureIcons: LucideIcon[] = [Palette, Gem, Headphones, HeartHandshake];

export function FeaturesSection({ config }: { config: SiteConfig }) {
  const copy = config.homepage.features;
  const features = config.productFeatures;

  if (features.length === 0) {
    return null;
  }

  return (
    <Reveal as="section" variant="slide-up" className="section-block section-divider-top">
      <div className="site-container">
        <div className="feature-section-header">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>

        <div className="feature-grid" data-reveal-stagger>
          {features.map((feature, index) => {
            const Icon = featureIcons[index % featureIcons.length];

            return (
              <article key={feature.title} className="feature-card" data-reveal="slide-up">
                <div className="feature-card-icon-wrap" aria-hidden>
                  <Icon className="feature-card-icon" strokeWidth={1.5} />
                </div>

                <div className="feature-card-copy">
                  <h3 className="feature-card-title">{feature.title}</h3>
                  <p className="feature-card-text">{feature.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}
