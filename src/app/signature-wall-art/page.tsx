import { SignatureWallArtView } from "@/components/signature/SignatureWallArtView";
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
    description:
      copy.pageIntro ||
      copy.subtitle ||
      "Signature wall art from the studio collection.",
  };
}

export default async function SignatureWallArtPage() {
  const [config, artworks] = await Promise.all([getSiteConfig(), getArtworks()]);

  return (
    <SignatureWallArtView
      copy={config.homepage.signatureWallArt ?? DEFAULT_HOMEPAGE.signatureWallArt}
      artworks={artworks}
    />
  );
}
