import type { Artwork, ArtworkCoverOrientation } from "@/types/artwork";

export function resolveArtworkCoverOrientation(
  artwork: Pick<Artwork, "coverOrientation">,
): ArtworkCoverOrientation {
  return artwork.coverOrientation === "landscape" ? "landscape" : "portrait";
}

export function artworkCoverFrameClass(
  artwork: Pick<Artwork, "coverOrientation">,
): string {
  const orientation = resolveArtworkCoverOrientation(artwork);
  return orientation === "landscape"
    ? "art-image-frame art-image-frame--landscape"
    : "art-image-frame art-image-frame--portrait";
}
