import type { Artwork, ArtworkCoverOrientation } from "@/types/artwork";

export function resolveArtworkCoverOrientation(
  artwork: Pick<Artwork, "coverOrientation">,
): ArtworkCoverOrientation {
  return artwork.coverOrientation === "landscape" ? "landscape" : "portrait";
}

/** Vertical 4:5 frame for all shop cards; use {@link coverImageObjectFitClass} for wide photos. */
export function artworkCoverFrameClass(): string {
  return "art-image-frame art-image-frame--portrait";
}
