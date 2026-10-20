import { ServicePageJsonLd } from "@/components/seo/ServicePageJsonLd";
import { ForInteriorDesignersView } from "@/components/trade/ForInteriorDesignersView";
import { DEFAULT_FOR_INTERIOR_DESIGNERS } from "@/lib/site-config/defaults";
import { buildPageMetadata, resolvePlainDescription } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site-data";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const page = config.forInteriorDesigners ?? DEFAULT_FOR_INTERIOR_DESIGNERS;

  return buildPageMetadata(
    config,
    "forInteriorDesigners",
    "/for-interior-designers",
    {
      title: page.hero.eyebrow || "For Interior Designers",
      description: page.hero.subtitle,
    },
  );
}

export default async function ForInteriorDesignersPage() {
  const config = await getSiteConfig();
  const page = config.forInteriorDesigners ?? DEFAULT_FOR_INTERIOR_DESIGNERS;
  const serviceDescription = resolvePlainDescription(page.hero.subtitle);

  return (
    <>
      <ServicePageJsonLd
        name={page.hero.title || page.hero.eyebrow || "For Interior Designers"}
        description={
          serviceDescription ||
          "Trade art programmes and project support for interior designers."
        }
        pathname="/for-interior-designers"
        serviceType="Art trade programme for interior designers"
        providerName={config.siteName}
      />
      <ForInteriorDesignersView config={config} />
    </>
  );
}
