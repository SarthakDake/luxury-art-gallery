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

export interface ArtistProfile {
  artistName: string;
  artistTagline: string;
  portraitImageUrl: string;
  biography: string;
  exhibitions: ArtistExhibition[];
  press: ArtistPressFeature[];
}
