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
 * - Browser-native formats are optimized by Next/Image.
 * - HEIC/TIFF/BMP are rasterized once by `/api/artwork-image` and served
 *   unoptimized so the Image Optimizer does not re-fetch/re-encode them
 *   (that double-pass was slow and could hang admin previews).
 */
export function ArtworkImage({ src, alt, ...props }: ArtworkImageProps) {
  const resolvedSrc = getArtworkImageSrc(src);
  const useUnoptimized =
    isGifImage(src) || needsBrowserRasterization(src);

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      unoptimized={useUnoptimized}
      {...props}
    />
  );
}
