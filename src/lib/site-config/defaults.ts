import type {
  HomepageSectionId,
  SiteBrandTokens,
  SiteConfig,
  SiteFeatureFlags,
  SiteHomepageConfig,
  SiteTestimonial,
} from "@/types/site-config";

export const DEFAULT_BRAND_TOKENS: SiteBrandTokens = {
  accent: "#c9a227",
  accentForeground: "#171717",
  background: "#ffffff",
  foreground: "#171717",
  muted: "#6b7280",
  surface: "#f9fafb",
  border: "#e5e7eb",
  darkAccent: "#d4a017",
  darkBackground: "#111111",
  darkForeground: "#e5e5e5",
  darkMuted: "#9ca3af",
  darkSurface: "#1a1a1a",
  darkBorder: "#2d2d2d",
  radiusSm: "0.25rem",
  radiusMd: "0.5rem",
  radiusLg: "0.75rem",
};

export const DEFAULT_FEATURE_FLAGS: SiteFeatureFlags = {
  homepageOffers: false,
  homepageFeatures: false,
  homepageTestimonials: false,
};

export const DEFAULT_HOMEPAGE_SECTION_ORDER: HomepageSectionId[] = [
  "hero",
  "trustBadges",
  "collections",
  "featured",
  "offers",
  "features",
  "testimonials",
];

export const DEFAULT_HOMEPAGE: SiteHomepageConfig = {
  sections: [
    { id: "hero", enabled: true },
    { id: "trustBadges", enabled: true },
    { id: "collections", enabled: true },
    { id: "featured", enabled: true },
    { id: "offers", enabled: false },
    { id: "features", enabled: false },
    { id: "testimonials", enabled: false },
  ],
  hero: {
    primaryCtaLabel: "Shop",
    primaryCtaHref: "/shop",
    secondaryCtaLabel: "About us",
    secondaryCtaHref: "/about",
  },
  collections: {
    eyebrow: "Browse by Medium",
    title: "Collections",
    actionLabel: "View all",
    actionHref: "/shop",
  },
  featured: {
    eyebrow: "Featured Collection",
    title: "Selected Works",
    actionLabel: "View Shop",
    actionHref: "/shop",
    limit: 4,
  },
  offers: {
    eyebrow: "Studio Offers",
    title: "Save on Your Next Piece",
  },
  features: {
    eyebrow: "Why Collect With Us",
    title: "Craft Your Unique Space With Us",
  },
  testimonials: {
    eyebrow: "Collector Notes",
    title: "What Clients Say",
  },
};

export const DEFAULT_TESTIMONIALS: SiteTestimonial[] = [
  {
    quote:
      "The texture work transformed our living room — it feels custom, calm, and completely ours.",
    name: "Priya M.",
    role: "Homeowner, Mumbai",
  },
  {
    quote:
      "Aishwarya understood the space instantly. The relief piece is the highlight of the lobby.",
    name: "Rahul S.",
    role: "Interior Designer, Pune",
  },
];

/** Legacy fields that remain at the root of SiteConfig for backward compatibility. */
export function createDefaultSiteConfig(partial?: Partial<SiteConfig>): SiteConfig {
  return {
    siteName: "Colors N Joy | Texture Art Studio",
    contactEmail: "colorsnjoybyaish@gmail.com",
    adminEmail: "sarthaksdake@gmail.com, colorsnjoybyaish@gmail.com",
    whatsappNumber: "+919423690682",
    studioAddress: "Via Navi Mumbai",
    heroTitle: "Turn Blank Walls into the Highlight of Your Space",
    heroSubtitle:
      "Thoughtfully designed custom wall art, texture art & relief wall art for luxury homes and commercial spaces.",
    announcements: [],
    trustBadges: [],
    defaultDispatchNote: "Made to Order | Dispatches in 14–21 Days",
    defaultCareGuide:
      "Handle artwork with clean, dry hands. Avoid direct sunlight and damp environments. Dust gently with a soft, dry microfiber cloth. Ensure secure hanging hardware for wall-mounted pieces.",
    defaultShippingReturns:
      "We ship worldwide with full tracking. Provide a complete delivery address at checkout. International orders may incur customs duties. Returns are accepted within 48 hours of delivery for damaged or incorrect items only.",
    defaultBeforeYouBuy:
      "Each work is handcrafted and unique. Slight variations in texture and tone are inherent to the medium and part of the artwork's character. Monitor color display may vary from the physical piece.",
    offers: [],
    productFeatures: [],
    visitorCounter: {
      eyebrow: "Shop Reach",
      singularLabel: "guest has explored our collection",
      pluralLabel: "guests have explored our collection",
    },
    socialLinks: {
      instagram: "",
      facebook: "",
      youtube: "",
      pinterest: "",
      whatsapp: "",
    },
    brand: { ...DEFAULT_BRAND_TOKENS },
    homepage: structuredClone(DEFAULT_HOMEPAGE),
    testimonials: structuredClone(DEFAULT_TESTIMONIALS),
    features: { ...DEFAULT_FEATURE_FLAGS },
    ...partial,
  };
}
