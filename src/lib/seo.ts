import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/auth-url";
import { getArtworkImageSrc } from "@/lib/artwork-image";
import { stripRichTextToPlain } from "@/lib/rich-text";
import type { Artwork } from "@/types/artwork";
import type { SiteConfig } from "@/types/site-config";

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function buildSiteMetadata(config: SiteConfig): Metadata {
  const title = config.siteName;

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: title,
      template: `%s · ${title}`,
    },
    description: config.heroSubtitle,
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description: config.heroSubtitle,
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: config.heroSubtitle,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildArtworkMetadata(
  artwork: Artwork,
  config: SiteConfig,
): Metadata {
  const plainDescription = stripRichTextToPlain(artwork.description);
  const description =
    plainDescription.length > 160
      ? `${plainDescription.slice(0, 157)}…`
      : plainDescription;

  const imageUrl = artwork.imageUrl
    ? new URL(getArtworkImageSrc(artwork.imageUrl), getMetadataBase())
    : undefined;

  return {
    title: artwork.title,
    description,
    openGraph: {
      title: artwork.title,
      description,
      type: "website",
      siteName: config.siteName,
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: artwork.title,
      description,
      ...(imageUrl ? { images: [imageUrl.toString()] } : {}),
    },
  };
}
