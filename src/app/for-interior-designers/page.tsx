import { ForInteriorDesignersView } from "@/components/trade/ForInteriorDesignersView";
import { DEFAULT_FOR_INTERIOR_DESIGNERS } from "@/lib/site-config/defaults";
import { getSiteConfig } from "@/lib/site-data";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const page = config.forInteriorDesigners ?? DEFAULT_FOR_INTERIOR_DESIGNERS;

  return {
    title: page.hero.eyebrow || "For Interior Designers",
    description: page.hero.subtitle,
  };
}

export default async function ForInteriorDesignersPage() {
  const config = await getSiteConfig();

  return <ForInteriorDesignersView config={config} />;
}
