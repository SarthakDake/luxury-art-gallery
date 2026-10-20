import type { Metadata } from "next";
import { getArtworkImageSrc } from "@/lib/artwork-image";
import { getSiteUrl } from "@/lib/auth-url";
import { stripRichTextToPlain } from "@/lib/rich-text";
import type { Artwork } from "@/types/artwork";
import type { SiteConfig, SiteSeoPageKey } from "@/types/site-config";

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

function truncateDescription(text: string, max = 160): string {
  const normalized = text.trim();
  if (normalized.length <= max) {
    return normalized;
  }
  return `${normalized.slice(0, max - 1).trim()}…`;
}

export function resolvePlainDescription(source: string): string {
  return truncateDescription(stripRichTextToPlain(source));
}

export function resolveSiteDescription(config: SiteConfig): string {
  const fromSeo = config.seo.defaultDescription.trim();
  if (fromSeo) {
    return resolvePlainDescription(fromSeo);
  }
  return resolvePlainDescription(config.heroSubtitle);
}

function resolveSiteKeywords(config: SiteConfig, pageKeywords?: string): string | undefined {
  const merged = [pageKeywords?.trim(), config.seo.defaultKeywords.trim()]
    .filter(Boolean)
    .join(", ");
  return merged || undefined;
}

export function resolveAbsoluteImageUrl(pathOrUrl: string | undefined): URL | undefined {
  const trimmed = pathOrUrl?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    return new URL(trimmed, getMetadataBase());
  } catch {
    return undefined;
  }
}

function resolveDefaultOgImage(config: SiteConfig): URL | undefined {
  const fromSeo = resolveAbsoluteImageUrl(config.seo.ogImageUrl);
  if (fromSeo) {
    return fromSeo;
  }

  const heroImage = config.homepage.hero.imageUrl?.trim();
  return heroImage ? resolveAbsoluteImageUrl(getArtworkImageSrc(heroImage)) : undefined;
}

export function buildCanonicalUrl(pathname: string): string {
  const base = getMetadataBase();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(path, base).toString();
}

function withSharedSiteFields(
  config: SiteConfig,
  partial: Metadata,
  options?: { keywords?: string; ogImage?: URL },
): Metadata {
  const defaultOg = options?.ogImage ?? resolveDefaultOgImage(config);
  const keywords = resolveSiteKeywords(config, options?.keywords);
  const verificationToken =
    config.seo.googleSiteVerification.trim() ||
    process.env.GOOGLE_SITE_VERIFICATION?.trim() ||
    "";

  return {
    ...partial,
    ...(keywords ? { keywords } : {}),
    ...(verificationToken
      ? { verification: { google: verificationToken } }
      : {}),
    openGraph: {
      ...partial.openGraph,
      siteName: config.siteName,
      locale: "en_IN",
      ...(defaultOg ? { images: [{ url: defaultOg }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...partial.twitter,
      ...(defaultOg ? { images: [defaultOg.toString()] } : {}),
    },
  };
}

export function buildSiteMetadata(config: SiteConfig): Metadata {
  const title = config.siteName;
  const description = resolveSiteDescription(config);
  const home = config.seo.pages.home;
  const homeTitle = home.title.trim() || title;
  const homeDescription = home.description.trim()
    ? resolvePlainDescription(home.description)
    : description;

  return withSharedSiteFields(
    config,
    {
      metadataBase: getMetadataBase(),
      title: {
        default: homeTitle,
        template: `%s · ${title}`,
      },
      description: homeDescription,
      openGraph: {
        type: "website",
        title: homeTitle,
        description: homeDescription,
      },
      twitter: {
        title: homeTitle,
        description: homeDescription,
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: buildCanonicalUrl("/"),
      },
    },
    { keywords: home.keywords },
  );
}

export interface PageSeoFallbacks {
  title: string;
  description: string;
  keywords?: string;
}

/** Metadata for routes without a dedicated CMS SEO page entry (e.g. dynamic slugs). */
export function buildRouteMetadata(
  config: SiteConfig,
  pathname: string,
  fallbacks: PageSeoFallbacks,
): Metadata {
  const title = fallbacks.title;
  const description = resolvePlainDescription(fallbacks.description);

  return withSharedSiteFields(
    config,
    {
      title,
      description,
      alternates: {
        canonical: buildCanonicalUrl(pathname),
      },
      openGraph: {
        type: "website",
        title,
        description,
        url: buildCanonicalUrl(pathname),
      },
      twitter: {
        title,
        description,
      },
    },
    { keywords: fallbacks.keywords },
  );
}

export function buildPageMetadata(
  config: SiteConfig,
  pageKey: SiteSeoPageKey,
  pathname: string,
  fallbacks: PageSeoFallbacks,
): Metadata {
  const page = config.seo.pages[pageKey];
  const title = page.title.trim() || fallbacks.title;
  const description = page.description.trim()
    ? resolvePlainDescription(page.description)
    : resolvePlainDescription(fallbacks.description);
  const keywords = page.keywords.trim() || fallbacks.keywords;

  return withSharedSiteFields(
    config,
    {
      title,
      description,
      alternates: {
        canonical: buildCanonicalUrl(pathname),
      },
      openGraph: {
        type: "website",
        title,
        description,
      },
      twitter: {
        title,
        description,
      },
    },
    { keywords },
  );
}

export function buildArtworkMetadata(
  artwork: Artwork,
  config: SiteConfig,
): Metadata {
  const plainDescription = stripRichTextToPlain(artwork.description);
  const description = truncateDescription(plainDescription);

  const imageUrl = artwork.imageUrl
    ? new URL(getArtworkImageSrc(artwork.imageUrl), getMetadataBase())
    : undefined;

  const pathname = `/art/${artwork.slug}`;

  return withSharedSiteFields(
    config,
    {
      title: artwork.title,
      description,
      alternates: {
        canonical: buildCanonicalUrl(pathname),
      },
      openGraph: {
        title: artwork.title,
        description,
        type: "website",
        url: buildCanonicalUrl(pathname),
        ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
      },
      twitter: {
        title: artwork.title,
        description,
        ...(imageUrl ? { images: [imageUrl.toString()] } : {}),
      },
    },
    { ogImage: imageUrl },
  );
}
