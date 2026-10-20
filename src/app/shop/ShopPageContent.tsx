"use client";

import { ShopFiltersPanel } from "@/components/shop/ShopFiltersPanel";
import type { Artwork } from "@/types/artwork";
import { useSearchParams } from "next/navigation";

export default function ShopPageContent({ artworks }: { artworks: Artwork[] }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");

  return (
    <ShopFiltersPanel
      key={`${categoryParam ?? "all"}-${subcategoryParam ?? "all"}`}
      artworks={artworks}
      categoryParam={categoryParam}
      subcategoryParam={subcategoryParam}
    />
  );
}
