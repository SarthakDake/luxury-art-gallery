import { ArtworkDetailClient } from "@/app/art/[slug]/ArtworkDetailClient";
import { getArtworks, getSiteConfig } from "@/lib/site-data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ArtworkPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArtworkDetailPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const artworks = await getArtworks();
  const siteConfig = await getSiteConfig();
  const artwork = artworks.find((item) => item.slug === slug);

  if (!artwork) {
    notFound();
  }

  return (
    <ArtworkDetailClient
      artwork={artwork}
      artworks={artworks}
      siteConfig={siteConfig}
    />
  );
}
