import { Reveal } from "@/components/motion/Reveal";
import { RichText } from "@/components/ui/RichText";
import { SoftImage } from "@/components/ui/SoftImage";
import { getArtworkImageSrc } from "@/lib/artwork-image";
import {
  DEFAULT_FOR_INTERIOR_DESIGNERS,
  DEFAULT_HOMEPAGE,
} from "@/lib/site-config/defaults";
import type { CuratedWorksCopy, ForInteriorDesignersConfig } from "@/types/site-config";
import Link from "next/link";

export function TradePartnersSection({
  copy,
  tradePage,
}: {
  copy: CuratedWorksCopy;
  tradePage: ForInteriorDesignersConfig | undefined;
}) {
  const resolvedCopy = copy ?? DEFAULT_HOMEPAGE.portfolio;
  const trade = tradePage ?? DEFAULT_FOR_INTERIOR_DESIGNERS;
  const rawImages =
    trade.homepageImages?.length > 0
      ? trade.homepageImages
      : DEFAULT_FOR_INTERIOR_DESIGNERS.homepageImages;
  const images = rawImages.filter((item) => item.imageUrl.trim());

  if (images.length === 0) {
    return null;
  }

  return (
    <Reveal
      as="section"
      variant="slide-up"
      className="site-container section-block section-divider-top"
    >
      <div className="section-header mb-10">
        <div className="section-header-copy">
          <p className="eyebrow">{resolvedCopy.eyebrow}</p>
          <h2 className="section-title">{resolvedCopy.title}</h2>
          {resolvedCopy.subtitle ? (
            <RichText content={resolvedCopy.subtitle} className="body-text mt-3 max-w-2xl" />
          ) : null}
        </div>
        {resolvedCopy.actionHref && resolvedCopy.actionLabel ? (
          <Link
            href={resolvedCopy.actionHref}
            className="btn-secondary btn-responsive section-header-action"
          >
            {resolvedCopy.actionLabel}
          </Link>
        ) : null}
      </div>

      <ul className="home-trade-gallery" data-reveal-stagger>
        {images.map((item, index) => (
          <li
            key={`${item.imageUrl}-${index}`}
            className={`home-trade-gallery-item home-trade-gallery-item--${(index % 3) + 1}`}
          >
            <div className="home-trade-gallery-media">
              <SoftImage
                src={getArtworkImageSrc(item.imageUrl)}
                alt={item.caption || "Trade partnership"}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            {item.caption ? (
              <p className="home-trade-gallery-caption">{item.caption}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
