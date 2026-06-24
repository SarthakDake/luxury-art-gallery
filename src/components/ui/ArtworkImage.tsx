import { getArtworkImageSrc, isHeicImage, isRemoteImageUrl } from "@/lib/artwork-image";
import Image, { type ImageProps } from "next/image";

type ArtworkImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

export function ArtworkImage({ src, alt, ...props }: ArtworkImageProps) {
  const resolvedSrc = getArtworkImageSrc(src);
  const useUnoptimized =
    isHeicImage(src) ||
    isRemoteImageUrl(src) ||
    resolvedSrc.startsWith("/api/");

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      unoptimized={useUnoptimized}
      {...props}
    />
  );
}
