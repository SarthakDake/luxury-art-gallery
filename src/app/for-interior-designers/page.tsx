import { ForInteriorDesignersView } from "@/components/trade/ForInteriorDesignersView";
import { getArtworks, getSiteConfig } from "@/lib/site-data";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const page = config.forInteriorDesigners;

  return {
    title: page.hero.eyebrow || "For Interior Designers",
    description: page.hero.subtitle,
  };
}

export default async function ForInteriorDesignersPage() {
  const [config, artworks] = await Promise.all([getSiteConfig(), getArtworks()]);

  return <ForInteriorDesignersView config={config} artworks={artworks} />;
}
