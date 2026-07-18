import {
  getArtworkImageSrc,
  isGifImage,
  needsBrowserRasterization,
} from "@/lib/artwork-image";
import Image, { type ImageProps } from "next/image";

type ArtworkImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

/**
 * Renders artwork/portrait images.
 * - Originals are stored as uploaded (including HEIC).
 * - Next/Image still optimizes delivery size for performance.
 * - GIF stays unoptimized to preserve animation.
 * - HEIC/TIFF/BMP are rasterized by `/api/artwork-image` then optimized.
 */
export function ArtworkImage({ src, alt, ...props }: ArtworkImageProps) {
  const resolvedSrc = getArtworkImageSrc(src);
  // Animated GIFs should not be re-encoded by the optimizer.
  const useUnoptimized = isGifImage(src) && !needsBrowserRasterization(src);

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      unoptimized={useUnoptimized}
      {...props}
    />
  );
}
