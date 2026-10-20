import type { SiteConfig, SiteSeoPageSettings } from "@/types/site-config";
import { SITE_SEO_PAGE_KEYS } from "@/lib/site-config/defaults";

function isBlank(value: string | undefined): boolean {
  return !value?.trim();
}

function mergePageSettings(
  existing: SiteSeoPageSettings,
  bundled: SiteSeoPageSettings,
): SiteSeoPageSettings {
  return {
    title: isBlank(existing.title) ? bundled.title : existing.title,
    description: isBlank(existing.description)
      ? bundled.description
      : existing.description,
    keywords: isBlank(existing.keywords) ? bundled.keywords : existing.keywords,
  };
}

/**
 * Fill empty SEO fields from bundled defaults without overwriting Content Studio edits.
 */
export function mergeBundledSeoIntoConfig(
  existing: SiteConfig,
  bundled: SiteConfig,
): SiteConfig {
  const nextSeo = { ...existing.seo };
  const bundledSeo = bundled.seo;

  if (isBlank(nextSeo.defaultDescription)) {
    nextSeo.defaultDescription = bundledSeo.defaultDescription;
  }
  if (isBlank(nextSeo.defaultKeywords)) {
    nextSeo.defaultKeywords = bundledSeo.defaultKeywords;
  }
  if (isBlank(nextSeo.ogImageUrl)) {
    nextSeo.ogImageUrl = bundledSeo.ogImageUrl;
  }
  if (isBlank(nextSeo.googleSiteVerification)) {
    nextSeo.googleSiteVerification = bundledSeo.googleSiteVerification;
  }

  const pages = { ...nextSeo.pages };
  for (const key of SITE_SEO_PAGE_KEYS) {
    pages[key] = mergePageSettings(pages[key], bundledSeo.pages[key]);
  }
  nextSeo.pages = pages;

  return {
    ...existing,
    seo: nextSeo,
  };
}
