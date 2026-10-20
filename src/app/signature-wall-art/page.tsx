import { ServicePageJsonLd } from "@/components/seo/ServicePageJsonLd";
import { SignatureWallArtView } from "@/components/signature/SignatureWallArtView";
import { DEFAULT_SIGNATURE_WALL_ART_PAGE } from "@/lib/site-config/defaults";
import { buildPageMetadata, resolvePlainDescription } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site-data";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const page = config.signatureWallArtPage ?? DEFAULT_SIGNATURE_WALL_ART_PAGE;

  return buildPageMetadata(config, "signatureWallArt", "/signature-wall-art", {
    title: page.intro.title,
    description:
      page.intro.subtitle || "Signature wall art from the studio collection.",
  });
}

export default async function SignatureWallArtPage() {
  const config = await getSiteConfig();
  const page = config.signatureWallArtPage ?? DEFAULT_SIGNATURE_WALL_ART_PAGE;
  const serviceDescription = resolvePlainDescription(
    page.intro.subtitle ||
      "Custom signature wall art commissions for luxury homes and commercial spaces.",
  );

  return (
    <>
      <ServicePageJsonLd
        name={page.intro.title || "Signature Wall Art"}
        description={serviceDescription}
        pathname="/signature-wall-art"
        serviceType="Custom wall art commissions"
        providerName={config.siteName}
      />
      <SignatureWallArtView page={page} siteConfig={config} />
    </>
  );
}
