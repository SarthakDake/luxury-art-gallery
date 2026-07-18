import { SignatureWallArtView } from "@/components/signature/SignatureWallArtView";
import { DEFAULT_SIGNATURE_WALL_ART_PAGE } from "@/lib/site-config/defaults";
import { getSiteConfig } from "@/lib/site-data";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const page = config.signatureWallArtPage ?? DEFAULT_SIGNATURE_WALL_ART_PAGE;

  return {
    title: page.intro.title,
    description:
      page.intro.subtitle || "Signature wall art from the studio collection.",
  };
}

export default async function SignatureWallArtPage() {
  const config = await getSiteConfig();

  return (
    <SignatureWallArtView
      page={config.signatureWallArtPage ?? DEFAULT_SIGNATURE_WALL_ART_PAGE}
      siteConfig={config}
    />
  );
}
