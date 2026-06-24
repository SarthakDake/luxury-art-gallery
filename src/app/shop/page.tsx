import { getArtworks } from "@/lib/site-data";
import type { Metadata } from "next";
import { Suspense } from "react";
import ShopPageContent from "./ShopPageContent";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse the full collection of original artworks.",
};

export default async function ShopPage() {
  const artworks = await getArtworks();

  return (
    <Suspense
      fallback={
        <div className="site-container py-16 text-sm text-[var(--muted)]">
          Loading gallery...
        </div>
      }
    >
      <ShopPageContent artworks={artworks} />
    </Suspense>
  );
}
