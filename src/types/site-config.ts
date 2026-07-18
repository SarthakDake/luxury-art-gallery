export interface SiteOffer {
  headline: string;
  code: string;
  detail: string;
}

export interface SiteProductFeature {
  title: string;
  description: string;
}

export interface SiteVisitorCounter {
  eyebrow: string;
  singularLabel: string;
  pluralLabel: string;
}

export interface SiteSocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
  pinterest: string;
  whatsapp: string;
}

/** CMS-editable brand tokens mapped onto CSS variables at runtime. */
export interface SiteBrandTokens {
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  muted: string;
  surface: string;
  border: string;
  darkAccent: string;
  darkBackground: string;
  darkForeground: string;
  darkMuted: string;
  darkSurface: string;
  darkBorder: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
}

export type HomepageSectionId =
  | "hero"
  | "trustBadges"
  | "collections"
  | "featured"
  | "signatureWallArt"
  | "portfolio"
  | "offers"
  | "features"
  | "testimonials";

export interface HomepageSectionConfig {
  id: HomepageSectionId;
  enabled: boolean;
}

export interface HomepageHeroContent {
  /** Public path for the landing-page hero background image. */
  imageUrl: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface HomepageSectionCopy {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface HomepageFeaturedCopy extends HomepageSectionCopy {
  limit: number;
}

/** Curated collection used on its dedicated page and as a homepage section. */
export interface CuratedWorksCopy extends HomepageFeaturedCopy {
  subtitle: string;
  /** Optional filter matched against category, subcategory, or title. */
  categoryFilter: string;
  /** Large hero image for the dedicated Signature Wall Art page. */
  pageImageUrl: string;
  /** Short introduction under the large image on the dedicated page. */
  pageIntro: string;
  /** How many works to show on the dedicated page grid. */
  pageLimit: number;
  /** CTA on the dedicated page (e.g. View Portfolio). */
  pageCtaLabel: string;
  pageCtaHref: string;
}

export interface SiteHomepageConfig {
  sections: HomepageSectionConfig[];
  hero: HomepageHeroContent;
  collections: HomepageSectionCopy;
  featured: HomepageFeaturedCopy;
  signatureWallArt: CuratedWorksCopy;
  portfolio: CuratedWorksCopy;
  offers: HomepageSectionCopy;
  features: HomepageSectionCopy;
  testimonials: HomepageSectionCopy;
}

export interface SiteTestimonial {
  quote: string;
  name: string;
  role: string;
}

/** Progressive ship toggles for new storefront capabilities. */
export interface SiteFeatureFlags {
  homepageOffers: boolean;
  homepageFeatures: boolean;
  homepageTestimonials: boolean;
}

export interface TradePoint {
  title: string;
  description: string;
}

export interface TradeProcessStep {
  title: string;
  description: string;
}

/** CMS config for the For Interior Designers / trade partner page. */
export interface ForInteriorDesignersConfig {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  whyPartner: {
    eyebrow: string;
    title: string;
    subtitle: string;
    points: TradePoint[];
  };
  benefits: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: TradePoint[];
  };
  portfolioPdf: {
    eyebrow: string;
    title: string;
    subtitle: string;
    downloadLabel: string;
    url: string;
    filename: string;
  };
  tradeProcess: {
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: TradeProcessStep[];
  };
  inquiryForm: {
    eyebrow: string;
    title: string;
    subtitle: string;
    submitLabel: string;
    successMessage: string;
    defaultSubject: string;
  };
}

export interface SiteConfig {
  siteName: string;
  contactEmail: string;
  adminEmail: string;
  whatsappNumber: string;
  studioAddress: string;
  heroTitle: string;
  heroSubtitle: string;
  announcements: string[];
  trustBadges: string[];
  defaultDispatchNote: string;
  defaultCareGuide: string;
  defaultShippingReturns: string;
  defaultBeforeYouBuy: string;
  offers: SiteOffer[];
  productFeatures: SiteProductFeature[];
  visitorCounter: SiteVisitorCounter;
  socialLinks: SiteSocialLinks;
  brand: SiteBrandTokens;
  homepage: SiteHomepageConfig;
  forInteriorDesigners: ForInteriorDesignersConfig;
  testimonials: SiteTestimonial[];
  features: SiteFeatureFlags;
}

export interface ArtistExhibition {
  year: number;
  title: string;
  location: string;
}

export interface ArtistPressFeature {
  publication: string;
  year: number;
  link: string;
}

/** Stat callouts on the About page (e.g. Major Exhibitions, Years in Practice). */
export interface ArtistHighlight {
  value: string;
  label: string;
}

export interface ArtistProfile {
  artistName: string;
  artistTagline: string;
  portraitImageUrl: string;
  biography: string;
  exhibitions: ArtistExhibition[];
  press: ArtistPressFeature[];
  highlights: ArtistHighlight[];
}
