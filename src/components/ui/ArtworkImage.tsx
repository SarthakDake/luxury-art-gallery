"use client";

import {
  getArtworkImageSrc,
  isGifImage,
  needsBrowserRasterization,
} from "@/lib/artwork-image";
import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type ArtworkImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

function mergeClassName(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ArtworkImageFrameProps = Omit<ArtworkImageProps, "src"> & {
  resolvedSrc: string;
  useUnoptimized: boolean;
};

function ArtworkImageFrame({
  resolvedSrc,
  useUnoptimized,
  alt,
  className,
  onLoad,
  onLoadingComplete,
  ...props
}: ArtworkImageFrameProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fallbackId = window.setTimeout(() => setLoaded(true), 2500);
    return () => window.clearTimeout(fallbackId);
  }, []);

  function markLoaded() {
    setLoaded(true);
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      unoptimized={useUnoptimized}
      className={mergeClassName(
        "media-fade",
        loaded ? "is-loaded" : undefined,
        className,
      )}
      onLoad={(event) => {
        markLoaded();
        onLoad?.(event);
      }}
      onLoadingComplete={(image) => {
        markLoaded();
        onLoadingComplete?.(image);
      }}
      {...props}
    />
  );
}

/**
 * Renders artwork/portrait images.
 * - Originals are stored as uploaded (including HEIC).
 * - Browser-native formats are optimized by Next/Image.
 * - HEIC/TIFF/BMP are rasterized once by `/api/artwork-image` and served
 *   unoptimized so the Image Optimizer does not re-fetch/re-encode them.
 * - Fades in with the same ease as scroll reveals once the bitmap is ready.
 */
export function ArtworkImage({ src, alt, ...props }: ArtworkImageProps) {
  const resolvedSrc = getArtworkImageSrc(src);
  const useUnoptimized = isGifImage(src) || needsBrowserRasterization(src);

  return (
    <ArtworkImageFrame
      key={resolvedSrc}
      resolvedSrc={resolvedSrc}
      useUnoptimized={useUnoptimized}
      alt={alt}
      {...props}
    />
  );
}
