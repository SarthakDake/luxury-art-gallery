import { ArtworkDetailClient } from "@/app/art/[slug]/ArtworkDetailClient";
import { getArtworks, getSiteConfig } from "@/lib/site-data";
import { notFound } from "next/navigation";

/** ISR fallback (seconds). CMS saves trigger on-demand revalidation immediately. */
export const revalidate = 3600;

export async function generateStaticParams() {
  const artworks = await getArtworks();

  return artworks.map((artwork) => ({
    slug: artwork.slug,
  }));
}

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
