import { Reveal } from "@/components/motion/Reveal";
import type { SiteConfig } from "@/types/site-config";

export function OffersSection({ config }: { config: SiteConfig }) {
  const copy = config.homepage.offers;
  const offers = config.offers;

  if (offers.length === 0) {
    return null;
  }

  return (
    <Reveal as="section" variant="slide-up" className="surface-section section-block">
      <div className="site-container space-y-8">
        <div className="section-header">
          <div className="section-header-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="section-title">{copy.title}</h2>
          </div>
        </div>

        <ul className="home-offers-grid" data-reveal-stagger>
          {offers.map((offer) => (
            <li key={offer.code} className="home-offer-item" data-reveal="slide-up">
              <p className="home-offer-headline">{offer.headline}</p>
              <p className="home-offer-code">{offer.code}</p>
              <p className="home-offer-detail">{offer.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
