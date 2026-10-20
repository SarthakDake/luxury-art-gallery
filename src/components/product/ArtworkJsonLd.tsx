import { getArtworkImageSrc } from "@/lib/artwork-image";
import { getSiteUrl } from "@/lib/auth-url";
import { stripRichTextToPlain } from "@/lib/rich-text";
import { getStartingPrice, isShowcaseOnly, type Artwork } from "@/types/artwork";

function resolveBrandName(siteName: string): string {
  return siteName.split("|")[0]?.trim() || siteName.trim() || "Colors N Joy";
}

export function ArtworkJsonLd({
  artwork,
  siteName,
}: {
  artwork: Artwork;
  siteName: string;
}) {
  const baseUrl = getSiteUrl();
  const productUrl = `${baseUrl}/art/${artwork.slug}`;
  const image = artwork.imageUrl
    ? new URL(getArtworkImageSrc(artwork.imageUrl), baseUrl).toString()
    : undefined;
  const brandName = resolveBrandName(siteName);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: artwork.title,
    description: stripRichTextToPlain(artwork.description),
    image,
    url: productUrl,
    sku: artwork.id,
    category: artwork.category,
    material: artwork.material,
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    ...(isShowcaseOnly(artwork)
      ? {}
      : {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: getStartingPrice(artwork),
            offerCount: artwork.sizes.length,
            url: productUrl,
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
