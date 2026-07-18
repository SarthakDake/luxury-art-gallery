import type {
  ForInteriorDesignersConfig,
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
  "signatureWallArt",
  "featured",
  "collections",
  "portfolio",
  "offers",
  "features",
  "testimonials",
];

export const DEFAULT_HOMEPAGE: SiteHomepageConfig = {
  sections: [
    { id: "hero", enabled: true },
    { id: "trustBadges", enabled: true },
    { id: "signatureWallArt", enabled: true },
    { id: "featured", enabled: true },
    { id: "collections", enabled: true },
    { id: "portfolio", enabled: true },
    { id: "offers", enabled: false },
    { id: "features", enabled: false },
    { id: "testimonials", enabled: false },
  ],
  hero: {
    imageUrl: "/hero-banner.jpg",
    primaryCtaLabel: "Signature Wall Art",
    primaryCtaHref: "/signature-wall-art",
    secondaryCtaLabel: "Shop",
    secondaryCtaHref: "/shop",
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
  signatureWallArt: {
    eyebrow: "Signature Collection",
    title: "Signature Wall Art",
    subtitle:
      "Statement pieces made to anchor living rooms, studios, and quiet corners.",
    actionLabel: "Explore Signature Works",
    actionHref: "/signature-wall-art",
    limit: 4,
    categoryFilter: "Ready to hang",
  },
  portfolio: {
    eyebrow: "Trade Partners",
    title: "For Interior Designers",
    subtitle:
      "Partner with Colors N Joy for custom wall art, trade-friendly process, and studio support on every project.",
    actionLabel: "Explore Trade Partnership",
    actionHref: "/for-interior-designers",
    limit: 4,
    categoryFilter: "",
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

export const DEFAULT_FOR_INTERIOR_DESIGNERS: ForInteriorDesignersConfig = {
  hero: {
    eyebrow: "For Interior Designers",
    title: "Art Partnerships for Elevated Interiors",
    subtitle:
      "Collaborate with Colors N Joy for custom texture art, signature wall pieces, and a trade process built around your project timeline.",
    imageUrl: "",
    primaryCtaLabel: "Start a Trade Inquiry",
    primaryCtaHref: "#inquiry",
    secondaryCtaLabel: "Download Portfolio PDF",
    secondaryCtaHref: "#portfolio-pdf",
  },
  whyPartner: {
    eyebrow: "Why Partner With Us",
    title: "A studio that designs with your space in mind",
    subtitle:
      "We work alongside designers and studios to create statement walls that feel intentional, site-specific, and ready for real interiors.",
    points: [
      {
        title: "Custom-led practice",
        description:
          "Every commission can be tailored to scale, palette, and the mood of the room.",
      },
      {
        title: "Trade-aware timelines",
        description:
          "Clear lead times and communication so your installation schedule stays on track.",
      },
      {
        title: "Material & finish expertise",
        description:
          "Texture, relief, and canvas work finished for lasting presence in homes and commercial spaces.",
      },
    ],
  },
  benefits: {
    eyebrow: "Benefits",
    title: "What you get when you partner with us",
    subtitle:
      "Practical support for design professionals — from concept through delivery.",
    items: [
      {
        title: "Trade consultation",
        description:
          "Share floor plans, references, and palette direction — we help refine the right artwork.",
      },
      {
        title: "Project samples & visuals",
        description:
          "Preview finishes and scale guidance before you commit for a client.",
      },
      {
        title: "Dedicated studio contact",
        description:
          "One point of contact for updates, packing details, and site-ready delivery notes.",
      },
      {
        title: "Flexible commissioning",
        description:
          "Adapt signature works or develop a fully custom piece for the brief.",
      },
    ],
  },
  portfolioPdf: {
    eyebrow: "Studio Portfolio",
    title: "Download the designer portfolio",
    subtitle:
      "A curated PDF overview of signature works and studio capabilities for your next client presentation.",
    downloadLabel: "Download Portfolio PDF",
    url: "",
    filename: "colors-n-joy-designer-portfolio.pdf",
  },
  tradeProcess: {
    eyebrow: "Trade Process",
    title: "How collaboration works",
    subtitle: "A clear path from first inquiry to installation-ready artwork.",
    steps: [
      {
        title: "Share the brief",
        description:
          "Tell us about the space, timeline, budget range, and preferred style.",
      },
      {
        title: "Concept & selection",
        description:
          "We propose signature options or a custom direction with scale and finish notes.",
      },
      {
        title: "Studio production",
        description:
          "Artwork is handcrafted to order with updates at key milestones.",
      },
      {
        title: "Delivery & install guidance",
        description:
          "Packed for safe transit with hanging and care notes for your team.",
      },
    ],
  },
  inquiryForm: {
    eyebrow: "Inquiry",
    title: "Start a trade conversation",
    subtitle:
      "Share a few project details and the studio will follow up with next steps.",
    submitLabel: "Send Trade Inquiry",
    successMessage:
      "Thank you — your inquiry has been sent. The studio will be in touch shortly.",
    defaultSubject: "Interior Designer Trade Inquiry",
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
    forInteriorDesigners: structuredClone(DEFAULT_FOR_INTERIOR_DESIGNERS),
    testimonials: structuredClone(DEFAULT_TESTIMONIALS),
    features: { ...DEFAULT_FEATURE_FLAGS },
    ...partial,
  };
}
