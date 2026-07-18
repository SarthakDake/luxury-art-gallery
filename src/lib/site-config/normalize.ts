import {
  DEFAULT_BRAND_TOKENS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_HOMEPAGE,
  DEFAULT_HOMEPAGE_SECTION_ORDER,
  DEFAULT_TESTIMONIALS,
} from "@/lib/site-config/defaults";
import type {
  HomepageSectionConfig,
  HomepageSectionId,
  SiteBrandTokens,
  SiteConfig,
  SiteFeatureFlags,
  SiteHomepageConfig,
  SiteTestimonial,
} from "@/types/site-config";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asPositiveInt(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  return fallback;
}

function mergeBrand(raw: unknown): SiteBrandTokens {
  const source = isRecord(raw) ? raw : {};
  return {
    accent: asString(source.accent, DEFAULT_BRAND_TOKENS.accent),
    accentForeground: asString(
      source.accentForeground,
      DEFAULT_BRAND_TOKENS.accentForeground,
    ),
    background: asString(source.background, DEFAULT_BRAND_TOKENS.background),
    foreground: asString(source.foreground, DEFAULT_BRAND_TOKENS.foreground),
    muted: asString(source.muted, DEFAULT_BRAND_TOKENS.muted),
    surface: asString(source.surface, DEFAULT_BRAND_TOKENS.surface),
    border: asString(source.border, DEFAULT_BRAND_TOKENS.border),
    darkAccent: asString(source.darkAccent, DEFAULT_BRAND_TOKENS.darkAccent),
    darkBackground: asString(
      source.darkBackground,
      DEFAULT_BRAND_TOKENS.darkBackground,
    ),
    darkForeground: asString(
      source.darkForeground,
      DEFAULT_BRAND_TOKENS.darkForeground,
    ),
    darkMuted: asString(source.darkMuted, DEFAULT_BRAND_TOKENS.darkMuted),
    darkSurface: asString(source.darkSurface, DEFAULT_BRAND_TOKENS.darkSurface),
    darkBorder: asString(source.darkBorder, DEFAULT_BRAND_TOKENS.darkBorder),
    radiusSm: asString(source.radiusSm, DEFAULT_BRAND_TOKENS.radiusSm),
    radiusMd: asString(source.radiusMd, DEFAULT_BRAND_TOKENS.radiusMd),
    radiusLg: asString(source.radiusLg, DEFAULT_BRAND_TOKENS.radiusLg),
  };
}

function mergeFeatureFlags(raw: unknown): SiteFeatureFlags {
  const source = isRecord(raw) ? raw : {};
  return {
    homepageOffers: asBoolean(
      source.homepageOffers,
      DEFAULT_FEATURE_FLAGS.homepageOffers,
    ),
    homepageFeatures: asBoolean(
      source.homepageFeatures,
      DEFAULT_FEATURE_FLAGS.homepageFeatures,
    ),
    homepageTestimonials: asBoolean(
      source.homepageTestimonials,
      DEFAULT_FEATURE_FLAGS.homepageTestimonials,
    ),
  };
}

function mergeHomepageSections(raw: unknown): HomepageSectionConfig[] {
  const byId = new Map<HomepageSectionId, boolean>();

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!isRecord(entry)) {
        continue;
      }
      const id = entry.id;
      if (
        typeof id === "string" &&
        DEFAULT_HOMEPAGE_SECTION_ORDER.includes(id as HomepageSectionId)
      ) {
        byId.set(id as HomepageSectionId, asBoolean(entry.enabled, true));
      }
    }
  }

  const orderedIds = [
    ...DEFAULT_HOMEPAGE_SECTION_ORDER.filter((id) => byId.has(id)),
    ...DEFAULT_HOMEPAGE_SECTION_ORDER.filter((id) => !byId.has(id)),
  ];

  // Preserve custom order from CMS when present; append any missing defaults.
  if (Array.isArray(raw) && raw.length > 0) {
    const seen = new Set<HomepageSectionId>();
    const customOrder: HomepageSectionId[] = [];

    for (const entry of raw) {
      if (!isRecord(entry) || typeof entry.id !== "string") {
        continue;
      }
      const id = entry.id as HomepageSectionId;
      if (!DEFAULT_HOMEPAGE_SECTION_ORDER.includes(id) || seen.has(id)) {
        continue;
      }
      seen.add(id);
      customOrder.push(id);
    }

    for (const id of DEFAULT_HOMEPAGE_SECTION_ORDER) {
      if (!seen.has(id)) {
        customOrder.push(id);
      }
    }

    return customOrder.map((id) => ({
      id,
      enabled: byId.has(id)
        ? Boolean(byId.get(id))
        : (DEFAULT_HOMEPAGE.sections.find((section) => section.id === id)?.enabled ??
          true),
    }));
  }

  return orderedIds.map((id) => ({
    id,
    enabled:
      DEFAULT_HOMEPAGE.sections.find((section) => section.id === id)?.enabled ?? true,
  }));
}

function mergeSectionCopy(
  raw: unknown,
  fallback: SiteHomepageConfig["collections"],
): SiteHomepageConfig["collections"] {
  const source = isRecord(raw) ? raw : {};
  return {
    eyebrow: asString(source.eyebrow, fallback.eyebrow),
    title: asString(source.title, fallback.title),
    actionLabel:
      source.actionLabel === undefined
        ? fallback.actionLabel
        : asString(source.actionLabel, fallback.actionLabel ?? ""),
    actionHref:
      source.actionHref === undefined
        ? fallback.actionHref
        : asString(source.actionHref, fallback.actionHref ?? ""),
  };
}

function mergeHomepage(raw: unknown): SiteHomepageConfig {
  const source = isRecord(raw) ? raw : {};
  const heroSource = isRecord(source.hero) ? source.hero : {};
  const featuredSource = isRecord(source.featured) ? source.featured : {};

  return {
    sections: mergeHomepageSections(source.sections),
    hero: {
      primaryCtaLabel: asString(
        heroSource.primaryCtaLabel,
        DEFAULT_HOMEPAGE.hero.primaryCtaLabel,
      ),
      primaryCtaHref: asString(
        heroSource.primaryCtaHref,
        DEFAULT_HOMEPAGE.hero.primaryCtaHref,
      ),
      secondaryCtaLabel: asString(
        heroSource.secondaryCtaLabel,
        DEFAULT_HOMEPAGE.hero.secondaryCtaLabel,
      ),
      secondaryCtaHref: asString(
        heroSource.secondaryCtaHref,
        DEFAULT_HOMEPAGE.hero.secondaryCtaHref,
      ),
    },
    collections: mergeSectionCopy(source.collections, DEFAULT_HOMEPAGE.collections),
    featured: {
      ...mergeSectionCopy(source.featured, DEFAULT_HOMEPAGE.featured),
      limit: asPositiveInt(featuredSource.limit, DEFAULT_HOMEPAGE.featured.limit),
    },
    offers: mergeSectionCopy(source.offers, DEFAULT_HOMEPAGE.offers),
    features: mergeSectionCopy(source.features, DEFAULT_HOMEPAGE.features),
    testimonials: mergeSectionCopy(
      source.testimonials,
      DEFAULT_HOMEPAGE.testimonials,
    ),
  };
}

function mergeTestimonials(raw: unknown): SiteTestimonial[] {
  if (!Array.isArray(raw)) {
    return structuredClone(DEFAULT_TESTIMONIALS);
  }

  return raw
    .filter(isRecord)
    .map((entry) => ({
      quote: asString(entry.quote).trim(),
      name: asString(entry.name).trim(),
      role: asString(entry.role).trim(),
    }))
    .filter((entry) => entry.quote && entry.name);
}

/**
 * Merge persisted CMS JSON with defaults so older snapshots remain valid
 * after theme/homepage schema expansions.
 */
export function normalizeSiteConfig(raw: unknown): SiteConfig {
  const source = isRecord(raw) ? raw : {};
  const visitor = isRecord(source.visitorCounter) ? source.visitorCounter : {};
  const social = isRecord(source.socialLinks) ? source.socialLinks : {};

  return {
    siteName: asString(source.siteName).trim(),
    contactEmail: asString(source.contactEmail).trim(),
    adminEmail: asString(source.adminEmail).trim(),
    whatsappNumber: asString(source.whatsappNumber).trim(),
    studioAddress: asString(source.studioAddress).trim(),
    heroTitle: asString(source.heroTitle).trim(),
    heroSubtitle: asString(source.heroSubtitle).trim(),
    announcements: Array.isArray(source.announcements)
      ? source.announcements
          .map((item) => asString(item).trim())
          .filter(Boolean)
      : [],
    trustBadges: Array.isArray(source.trustBadges)
      ? source.trustBadges.map((item) => asString(item).trim()).filter(Boolean)
      : [],
    defaultDispatchNote: asString(source.defaultDispatchNote).trim(),
    defaultCareGuide: asString(source.defaultCareGuide).trim(),
    defaultShippingReturns: asString(source.defaultShippingReturns).trim(),
    defaultBeforeYouBuy: asString(source.defaultBeforeYouBuy).trim(),
    offers: Array.isArray(source.offers)
      ? source.offers
          .filter(isRecord)
          .map((offer) => ({
            headline: asString(offer.headline).trim(),
            code: asString(offer.code).trim(),
            detail: asString(offer.detail).trim(),
          }))
          .filter((offer) => offer.headline && offer.code)
      : [],
    productFeatures: Array.isArray(source.productFeatures)
      ? source.productFeatures
          .filter(isRecord)
          .map((feature) => ({
            title: asString(feature.title).trim(),
            description: asString(feature.description).trim(),
          }))
          .filter((feature) => feature.title)
      : [],
    visitorCounter: {
      eyebrow: asString(visitor.eyebrow, "Gallery Reach").trim(),
      singularLabel: asString(
        visitor.singularLabel,
        "guest has explored our collection",
      ).trim(),
      pluralLabel: asString(
        visitor.pluralLabel,
        "guests have explored our collection",
      ).trim(),
    },
    socialLinks: {
      instagram: asString(social.instagram).trim(),
      facebook: asString(social.facebook).trim(),
      youtube: asString(social.youtube).trim(),
      pinterest: asString(social.pinterest).trim(),
      whatsapp: asString(social.whatsapp).trim(),
    },
    brand: mergeBrand(source.brand),
    homepage: mergeHomepage(source.homepage),
    testimonials: mergeTestimonials(source.testimonials),
    features: mergeFeatureFlags(source.features),
  };
}

export function isFeatureEnabled(
  config: SiteConfig,
  flag: keyof SiteFeatureFlags,
): boolean {
  return Boolean(config.features[flag]);
}

export function getEnabledHomepageSections(config: SiteConfig): HomepageSectionId[] {
  return config.homepage.sections
    .filter((section) => {
      if (!section.enabled) {
        return false;
      }

      if (section.id === "offers") {
        return isFeatureEnabled(config, "homepageOffers");
      }
      if (section.id === "features") {
        return isFeatureEnabled(config, "homepageFeatures");
      }
      if (section.id === "testimonials") {
        return isFeatureEnabled(config, "homepageTestimonials");
      }

      return true;
    })
    .map((section) => section.id);
}

/** Public subset safe to expose without admin credentials. */
export function toPublicSiteConfig(config: SiteConfig) {
  return {
    siteName: config.siteName,
    contactEmail: config.contactEmail,
    whatsappNumber: config.whatsappNumber,
    studioAddress: config.studioAddress,
    heroTitle: config.heroTitle,
    heroSubtitle: config.heroSubtitle,
    announcements: config.announcements,
    trustBadges: config.trustBadges,
    offers: config.offers,
    productFeatures: config.productFeatures,
    visitorCounter: config.visitorCounter,
    socialLinks: config.socialLinks,
    brand: config.brand,
    homepage: config.homepage,
    testimonials: config.testimonials,
    features: config.features,
  };
}
