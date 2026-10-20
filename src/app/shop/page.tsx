import { buildPageMetadata } from "@/lib/seo";
import { getArtworks, getSiteConfig } from "@/lib/site-data";
import type { Metadata } from "next";
import { Suspense } from "react";
import ShopPageContent from "./ShopPageContent";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  return buildPageMetadata(config, "shop", "/shop", {
    title: "Shop",
    description: "Browse the full collection of original artworks.",
  });
}

export default async function ShopPage() {
  const artworks = await getArtworks();

  return (
    <Suspense
      fallback={
        <div className="site-container py-16 text-sm text-[var(--muted)]">
          Loading shop...
        </div>
      }
    >
      <ShopPageContent artworks={artworks} />
    </Suspense>
  );
}
