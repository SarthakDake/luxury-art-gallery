import { getArtworkImageSrc } from "@/lib/artwork-image";
import { getSiteUrl } from "@/lib/auth-url";
import { stripRichTextToPlain } from "@/lib/rich-text";
import { getStartingPrice, isShowcaseOnly, type Artwork } from "@/types/artwork";

export function ArtworkJsonLd({ artwork }: { artwork: Artwork }) {
  const baseUrl = getSiteUrl();
  const image = artwork.imageUrl
    ? new URL(getArtworkImageSrc(artwork.imageUrl), baseUrl).toString()
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: artwork.title,
    description: stripRichTextToPlain(artwork.description),
    image,
    category: artwork.category,
    material: artwork.material,
  ...(isShowcaseOnly(artwork)
      ? {}
      : {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: getStartingPrice(artwork),
            offerCount: artwork.sizes.length,
            availability: artwork.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
