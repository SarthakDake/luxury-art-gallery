"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

function mergeClassName(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Next/Image with the site’s reveal-matched fade-in once the bitmap is ready.
 */
export function SoftImage({
  className,
  onLoad,
  onLoadingComplete,
  src,
  ...props
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const srcKey = typeof src === "string" ? src : JSON.stringify(src);

  useEffect(() => {
    setLoaded(false);
    const fallbackId = window.setTimeout(() => setLoaded(true), 2500);
    return () => window.clearTimeout(fallbackId);
  }, [srcKey]);

  function markLoaded() {
    setLoaded(true);
  }

  return (
    <Image
      src={src}
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
