import { assertAdminSession } from "@/lib/admin";
import { getSiteConfig, saveSiteConfig } from "@/lib/site-data";
import type { SiteConfig } from "@/types/site-config";

export const dynamic = "force-dynamic";

function normalizeConfig(raw: SiteConfig): SiteConfig {
  return {
    siteName: raw.siteName.trim(),
    contactEmail: raw.contactEmail.trim(),
    adminEmail: raw.adminEmail.trim(),
    whatsappNumber: raw.whatsappNumber.trim(),
    studioAddress: raw.studioAddress.trim(),
    heroTitle: raw.heroTitle.trim(),
    heroSubtitle: raw.heroSubtitle.trim(),
    announcements: (raw.announcements ?? []).map((item) => item.trim()).filter(Boolean),
    trustBadges: (raw.trustBadges ?? []).map((item) => item.trim()).filter(Boolean),
    defaultDispatchNote: raw.defaultDispatchNote.trim(),
    defaultCareGuide: raw.defaultCareGuide.trim(),
    defaultShippingReturns: raw.defaultShippingReturns.trim(),
    defaultBeforeYouBuy: raw.defaultBeforeYouBuy.trim(),
    offers: (raw.offers ?? [])
      .filter((offer) => offer.headline.trim() && offer.code.trim())
      .map((offer) => ({
        headline: offer.headline.trim(),
        code: offer.code.trim(),
        detail: offer.detail.trim(),
      })),
    productFeatures: (raw.productFeatures ?? [])
      .filter((feature) => feature.title.trim())
      .map((feature) => ({
        title: feature.title.trim(),
        description: feature.description.trim(),
      })),
    visitorCounter: {
      eyebrow: raw.visitorCounter.eyebrow.trim(),
      singularLabel: raw.visitorCounter.singularLabel.trim(),
      pluralLabel: raw.visitorCounter.pluralLabel.trim(),
    },
    socialLinks: {
      instagram: raw.socialLinks.instagram.trim(),
      facebook: raw.socialLinks.facebook.trim(),
      youtube: raw.socialLinks.youtube.trim(),
      pinterest: raw.socialLinks.pinterest.trim(),
      whatsapp: raw.socialLinks.whatsapp.trim(),
    },
  };
}

export async function GET() {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ config: getSiteConfig() });
}

export async function PUT(request: Request) {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { config?: SiteConfig };

  try {
    payload = (await request.json()) as { config?: SiteConfig };
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload.config) {
    return Response.json({ error: "config object is required." }, { status: 400 });
  }

  const config = normalizeConfig(payload.config);

  if (!config.siteName || !config.contactEmail) {
    return Response.json(
      { error: "Site name and contact email are required." },
      { status: 400 },
    );
  }

  try {
    saveSiteConfig(config);
  } catch (error) {
    console.error("[content] save config failed:", error);
    return Response.json({ error: "Could not save site settings." }, { status: 500 });
  }

  return Response.json({ config });
}
