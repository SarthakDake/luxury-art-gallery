import { getArtworks } from "@/lib/site-data";
import { Suspense } from "react";
import ShopPageContent from "./ShopPageContent";

/** ISR fallback (seconds). CMS saves trigger on-demand revalidation immediately. */
export const revalidate = 3600;

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
