import { getArtworkImageSrc } from "@/lib/artwork-image";
import { getSiteUrl } from "@/lib/auth-url";
import { resolveSiteDescription } from "@/lib/seo";
import { stripRichTextToPlain } from "@/lib/rich-text";
import type { ArtistProfile } from "@/types/site-config";
import type { SiteConfig } from "@/types/site-config";

function collectSameAs(config: SiteConfig): string[] {
  const links = Object.values(config.socialLinks)
    .map((value) => value.trim())
    .filter((value) => value.startsWith("http"));

  const unique = new Set(links);
  return [...unique];
}

function resolveOrganizationImage(config: SiteConfig, baseUrl: string): string | undefined {
  const og = config.seo.ogImageUrl.trim();
  if (og) {
    return new URL(og, baseUrl).toString();
  }

  const hero = config.homepage.hero.imageUrl?.trim();
  if (!hero) {
    return undefined;
  }

  return new URL(getArtworkImageSrc(hero), baseUrl).toString();
}

export function SiteJsonLd({
  config,
  artist,
}: {
  config: SiteConfig;
  artist: ArtistProfile;
}) {
  const baseUrl = getSiteUrl();
  const description = resolveSiteDescription(config);
  const sameAs = collectSameAs(config);
  const orgImage = resolveOrganizationImage(config, baseUrl);
  const portrait = artist.portraitImageUrl?.trim()
    ? new URL(getArtworkImageSrc(artist.portraitImageUrl), baseUrl).toString()
    : undefined;
  const biographyPlain = stripRichTextToPlain(artist.biography);
  const artistDescription =
    biographyPlain.length > 320
      ? `${biographyPlain.slice(0, 317)}…`
      : biographyPlain;

  const graph = [
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: config.siteName,
      description,
      inLanguage: "en-IN",
      publisher: { "@id": `${baseUrl}/#organization` },
    },
    {
      "@type": ["Organization", "LocalBusiness", "ArtGallery"],
      "@id": `${baseUrl}/#organization`,
      name: config.siteName,
      url: baseUrl,
      description,
      ...(orgImage ? { image: orgImage, logo: orgImage } : {}),
      ...(config.contactEmail
        ? { email: config.contactEmail.split(",")[0]?.trim() }
        : {}),
      ...(config.whatsappNumber ? { telephone: config.whatsappNumber } : {}),
      ...(config.studioAddress.trim()
        ? {
            address: {
              "@type": "PostalAddress",
              streetAddress: config.studioAddress,
            },
          }
        : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      "@type": "Person",
      "@id": `${baseUrl}/#artist`,
      name: artist.artistName || config.siteName,
      ...(artist.artistTagline ? { jobTitle: artist.artistTagline } : {}),
      ...(artistDescription ? { description: artistDescription } : {}),
      ...(portrait ? { image: portrait } : {}),
      url: `${baseUrl}/about`,
      worksFor: { "@id": `${baseUrl}/#organization` },
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
