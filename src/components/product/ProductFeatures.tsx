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

export function ProductFeatures({ config }: { config: SiteConfig }) {
  return (
    <Reveal as="section" variant="slide-up" className="surface-section feature-section">
      <div className="site-container">
        <div className="feature-section-header">
          <p className="eyebrow">Why Collect With Us</p>
          <h2 className="section-title">Craft Your Unique Space With Us</h2>
        </div>

        <div className="feature-grid" data-reveal-stagger>
          {config.productFeatures.map((feature, index) => {
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
