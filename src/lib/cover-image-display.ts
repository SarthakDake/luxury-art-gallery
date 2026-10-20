import type { ArtworkCoverOrientation } from "@/types/artwork";
import type { SignatureCoverOrientation } from "@/types/site-config";

export type CoverOrientation = ArtworkCoverOrientation | SignatureCoverOrientation;

/** Site-wide: vertical 4:5 frames; horizontal uploads letterbox with contain. */
export function coverImageObjectFitClass(
  orientation: CoverOrientation | undefined,
): string {
  return orientation === "landscape"
    ? "object-contain object-center"
    : "object-cover object-center";
}

/** Detect cover orientation from a browser File (before or after upload). */
export function detectCoverOrientationFromFile(
  file: File,
): Promise<CoverOrientation> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);

    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(
        image.naturalWidth > image.naturalHeight ? "landscape" : "portrait",
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("portrait");
    };
    image.src = url;
  });
}
