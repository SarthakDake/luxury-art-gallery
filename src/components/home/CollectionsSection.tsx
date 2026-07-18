import { Reveal } from "@/components/motion/Reveal";
import { CategoryPills } from "@/components/shop/CategoryPills";
import type { Artwork } from "@/types/artwork";
import type { SiteConfig } from "@/types/site-config";
import Link from "next/link";

export function CollectionsSection({
  config,
  artworks,
}: {
  config: SiteConfig;
  artworks: Artwork[];
}) {
  const copy = config.homepage.collections;

  return (
    <Reveal as="section" variant="slide-up" className="surface-section section-block">
      <div className="site-container space-y-8">
        <div className="section-header">
          <div className="section-header-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="section-title">{copy.title}</h2>
          </div>
          {copy.actionHref && copy.actionLabel ? (
            <Link href={copy.actionHref} className="btn-text section-header-action">
              {copy.actionLabel}
            </Link>
          ) : null}
        </div>
        <CategoryPills linkMode artworks={artworks} />
      </div>
    </Reveal>
  );
}
