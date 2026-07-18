import type {
  ForInteriorDesignersConfig,
  HomepageSectionId,
  SignatureWallArtPageConfig,
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
    { id: "collections", enabled: false },
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
    pageImageUrl: "/site/signature-page-hero.jpg",
    pageIntro:
      "A focused selection of premium wall pieces — crafted to become the quiet center of a room.",
    pageLimit: 6,
    pageCtaLabel: "View Portfolio",
    pageCtaHref: "/for-interior-designers",
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
    pageImageUrl: "",
    pageIntro: "",
    pageLimit: 6,
    pageCtaLabel: "View Portfolio",
    pageCtaHref: "/for-interior-designers",
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
    imageUrl: "/site/trade-hero.jpg",
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
    url: "/documents/designer-portfolio.pdf",
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

export const DEFAULT_SIGNATURE_WALL_ART_PAGE: SignatureWallArtPageConfig = {
  hero: {
    imageUrl: "/site/signature-page-hero.jpg",
  },
  intro: {
    eyebrow: "Signature Collection",
    title: "Signature Wall Art",
    subtitle:
      "Five statement projects crafted for elevated interiors — explore the story, finishes, and design language behind each wall.",
  },
  projects: {
    eyebrow: "Featured Projects",
    title: "Five statement walls",
    subtitle:
      "Each project is a showcase of texture, scale, and atmosphere. Open a project to see design styles, process imagery, and client notes.",
    items: [
      {
        slug: "coastal-calm",
        title: "Coastal Calm",
        summary:
          "Soft mineral textures and layered neutrals for a seaside living room that feels open and restful.",
        coverImageUrl: "/artworks/sample1.jpg",
        designStyles: [
          {
            imageUrl: "/artworks/sample1.jpg",
            title: "Tide Line Relief",
            description:
              "A low-relief wave rhythm in sand and chalk tones, designed to catch soft morning light across a long sofa wall.",
          },
          {
            imageUrl: "/artworks/sample2.jpg",
            title: "Salt Mist Palette",
            description:
              "Muted greys and warm whites keep the composition quiet, so furniture and drapery stay the supporting cast.",
          },
          {
            imageUrl: "/artworks/green_leaf_1.jpg",
            title: "Organic Edge Detail",
            description:
              "Hand-finished edges and subtle pigment washes add depth without competing with ocean views.",
          },
        ],
        galleryImages: [
          "/artworks/sample1.jpg",
          "/artworks/sample2.jpg",
          "/artworks/sample3.jpg",
          "/artworks/green_leaf_1.jpg",
        ],
        testimonials: [
          {
            quote:
              "The wall feels like the room finally exhaled. Guests always ask who made it.",
            name: "Meera K.",
            role: "Homeowner, Alibaug",
          },
        ],
      },
      {
        slug: "desert-texture",
        title: "Desert Texture",
        summary:
          "Warm clay and ochre reliefs that bring grounded warmth to a contemporary lounge.",
        coverImageUrl: "/artworks/sample2.jpg",
        designStyles: [
          {
            imageUrl: "/artworks/sample2.jpg",
            title: "Dune Contour",
            description:
              "Sculpted ridges echo desert topography — calm from afar, rich up close.",
          },
          {
            imageUrl: "/artworks/sample4.jpg",
            title: "Sun-baked Finish",
            description:
              "Matte mineral pigments hold warmth through the day without glare on evening lighting.",
          },
        ],
        galleryImages: [
          "/artworks/sample2.jpg",
          "/artworks/sample4.jpg",
          "/artworks/sample5.jpg",
        ],
        testimonials: [
          {
            quote:
              "It became the quiet hero of the lounge — textured, warm, and perfectly scaled.",
            name: "Ananya R.",
            role: "Interior Designer, Jaipur",
          },
        ],
      },
      {
        slug: "forest-relief",
        title: "Forest Relief",
        summary:
          "Botanical depth and layered greens for a dining space that feels immersive and alive.",
        coverImageUrl: "/artworks/green_leaf_1.jpg",
        designStyles: [
          {
            imageUrl: "/artworks/green_leaf_1.jpg",
            title: "Canopy Layers",
            description:
              "Overlapping leaf forms create soft shadow play across the dining wall.",
          },
          {
            imageUrl: "/artworks/sample3.jpg",
            title: "Moss & Stone",
            description:
              "Deep greens against cool mineral bases keep the palette grounded and timeless.",
          },
          {
            imageUrl: "/artworks/sample5.jpg",
            title: "Evening Glow",
            description:
              "Under accent lighting, the relief reads sculptural without overpowering the table setting.",
          },
        ],
        galleryImages: [
          "/artworks/green_leaf_1.jpg",
          "/artworks/sample3.jpg",
          "/artworks/sample5.jpg",
          "/artworks/sample1.jpg",
        ],
        testimonials: [
          {
            quote:
              "Dinner conversations start with the wall. It feels custom in the best way.",
            name: "Kabir N.",
            role: "Homeowner, Pune",
          },
        ],
      },
      {
        slug: "urban-neutral",
        title: "Urban Neutral",
        summary:
          "Architectural texture in charcoal and bone for a city apartment that wants calm structure.",
        coverImageUrl: "/artworks/sample3.jpg",
        designStyles: [
          {
            imageUrl: "/artworks/sample3.jpg",
            title: "Grid Softened",
            description:
              "A gentle geometric field that organizes the wall without feeling corporate.",
          },
          {
            imageUrl: "/artworks/sample5.jpg",
            title: "Concrete Whisper",
            description:
              "Cool greys and soft plaster tones pair with black metal and oak furniture.",
          },
        ],
        galleryImages: [
          "/artworks/sample3.jpg",
          "/artworks/sample5.jpg",
          "/artworks/sample4.jpg",
          "/artworks/sample2.jpg",
        ],
        testimonials: [
          {
            quote:
              "Exactly the quiet structure our apartment needed — refined, not loud.",
            name: "Sonia D.",
            role: "Architect, Mumbai",
          },
        ],
      },
      {
        slug: "luminous-veil",
        title: "Luminous Veil",
        summary:
          "Translucent layers and soft luminosity for a bedroom wall that feels private and serene.",
        coverImageUrl: "/artworks/sample4.jpg",
        designStyles: [
          {
            imageUrl: "/artworks/sample4.jpg",
            title: "Veil Layers",
            description:
              "Sheer pigment washes over subtle relief create a soft glow beside the bed.",
          },
          {
            imageUrl: "/artworks/sample1.jpg",
            title: "Dawn Palette",
            description:
              "Pale ivory and mist tones keep the room calm from first light to evening lamps.",
          },
          {
            imageUrl: "/artworks/sample2.jpg",
            title: "Quiet Focal Point",
            description:
              "Scaled for intimacy — present enough to center the room, never restless.",
          },
        ],
        galleryImages: [
          "/artworks/sample4.jpg",
          "/artworks/sample1.jpg",
          "/artworks/sample2.jpg",
        ],
        testimonials: [
          {
            quote:
              "Waking up to this wall feels intentional. Soft, luminous, and completely personal.",
            name: "Isha V.",
            role: "Homeowner, Bengaluru",
          },
        ],
      },
    ],
  },
  process: {
    eyebrow: "Our Process",
    title: "How statement wall art comes to life",
    subtitle:
      "A clear studio process from first conversation to installation-ready finish.",
    steps: [
      {
        title: "Discover the space",
        description:
          "We review room photos, dimensions, lighting, and the mood you want the wall to hold.",
      },
      {
        title: "Shape the concept",
        description:
          "Palette, texture language, and scale are refined into a clear direction before making begins.",
      },
      {
        title: "Handcraft the piece",
        description:
          "Relief, texture, and finish are built by hand so every surface feels intentional and lasting.",
      },
      {
        title: "Install & settle in",
        description:
          "Delivery guidance and hanging notes help the artwork land cleanly in your interior.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions about statement wall art",
    subtitle:
      "Practical answers for homeowners and designers considering a signature wall.",
    items: [
      {
        question: "Is Signature Wall Art available for purchase online?",
        answer:
          "These projects are showcase commissions. They are not listed with shop sizes or checkout — enquire via WhatsApp or the inquiry form to start a custom piece for your space.",
      },
      {
        question: "Can you match an existing interior palette?",
        answer:
          "Yes. Share references, fabrics, or paint codes and we tailor texture and tone to your room.",
      },
      {
        question: "What spaces work best for statement walls?",
        answer:
          "Living rooms, dining walls, bedroom feature walls, lobbies, and quiet commercial corners all work well when scale and lighting are considered together.",
      },
      {
        question: "How long does a custom project take?",
        answer:
          "Timelines vary with scale and finish. After the concept is approved, most statement pieces are crafted within a planned studio window shared at inquiry.",
      },
    ],
  },
  inquiry: {
    eyebrow: "Inquire",
    title: "Start your signature wall",
    subtitle:
      "Tell us about your space — or message the studio on WhatsApp for a quicker conversation.",
    formCtaLabel: "Fill inquiry form",
    formHref: "#inquiry",
    whatsappLabel: "Connect on WhatsApp",
    submitLabel: "Send Inquiry",
    successMessage:
      "Thank you — your inquiry has been sent. The studio will be in touch shortly.",
    defaultSubject: "Signature Wall Art Inquiry",
  },
};

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
    signatureWallArtPage: structuredClone(DEFAULT_SIGNATURE_WALL_ART_PAGE),
    forInteriorDesigners: structuredClone(DEFAULT_FOR_INTERIOR_DESIGNERS),
    testimonials: structuredClone(DEFAULT_TESTIMONIALS),
    features: { ...DEFAULT_FEATURE_FLAGS },
    ...partial,
  };
}
