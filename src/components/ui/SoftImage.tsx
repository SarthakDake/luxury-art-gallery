"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

function mergeClassName(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function SoftImageFrame({
  className,
  onLoad,
  onLoadingComplete,
  alt = "",
  src,
  ...props
}: ImageProps) {
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
      src={src}
      alt={alt}
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
 * Next/Image with the site’s reveal-matched fade-in once the bitmap is ready.
 */
export function SoftImage(props: ImageProps) {
  const srcKey =
    typeof props.src === "string" ? props.src : JSON.stringify(props.src);

  return <SoftImageFrame key={srcKey} {...props} />;
}
