import { ArtworkDetailClient } from "@/app/art/[slug]/ArtworkDetailClient";
import { ArtworkJsonLd } from "@/components/product/ArtworkJsonLd";
import { getArtworks, getSiteConfig } from "@/lib/site-data";
import { buildArtworkMetadata } from "@/lib/seo";
import type { Metadata } from "next";
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

export async function generateMetadata({
  params,
}: ArtworkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [artworks, siteConfig] = await Promise.all([
    getArtworks(),
    getSiteConfig(),
  ]);
  const artwork = artworks.find((item) => item.slug === slug);

  if (!artwork) {
    return { title: "Artwork not found" };
  }

  return buildArtworkMetadata(artwork, siteConfig);
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
    <>
      <ArtworkJsonLd artwork={artwork} />
      <ArtworkDetailClient
        artwork={artwork}
        artworks={artworks}
        siteConfig={siteConfig}
      />
    </>
  );
}
