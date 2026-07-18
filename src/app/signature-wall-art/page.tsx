import { CuratedCollectionPage } from "@/components/curated/CuratedCollectionPage";
import { DEFAULT_HOMEPAGE } from "@/lib/site-config/defaults";
import { getArtworks, getSiteConfig } from "@/lib/site-data";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const copy =
    config.homepage.signatureWallArt ?? DEFAULT_HOMEPAGE.signatureWallArt;

  return {
    title: copy.title,
    description: copy.subtitle || "Signature wall art from the studio collection.",
  };
}

export default async function SignatureWallArtPage() {
  const [config, artworks] = await Promise.all([getSiteConfig(), getArtworks()]);

  return (
    <CuratedCollectionPage
      copy={config.homepage.signatureWallArt ?? DEFAULT_HOMEPAGE.signatureWallArt}
      artworks={artworks}
      breadcrumbLabel="Signature Wall Art"
      fallbackCopy={DEFAULT_HOMEPAGE.signatureWallArt}
    />
  );
}
