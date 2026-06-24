import { getBlobPathnameFromUrl } from "@/lib/blob-storage";

export const ARTWORK_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
] as const;

export type ArtworkImageExtension = (typeof ARTWORK_IMAGE_EXTENSIONS)[number];

export function getArtworkImageExtension(src: string): string | null {
  const match = src.match(/(\.[a-z0-9]+)(?:\?.*)?$/i);
  if (!match) return null;

  const extension = match[1].toLowerCase();
  return ARTWORK_IMAGE_EXTENSIONS.includes(extension as ArtworkImageExtension)
    ? extension
    : null;
}

export function isHeicImage(src: string): boolean {
  const extension = getArtworkImageExtension(src);
  return extension === ".heic" || extension === ".heif";
}

export function isSupportedArtworkImage(src: string): boolean {
  return getArtworkImageExtension(src) !== null;
}

export function isRemoteImageUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

export const CONTENT_STUDIO_IMAGE_PREFIXES = ["/artworks/", "/portraits/"] as const;

export function splitImagePathAndSearch(src: string): {
  pathname: string;
  search: string;
} {
  const queryIndex = src.indexOf("?");

  if (queryIndex === -1) {
    return { pathname: src, search: "" };
  }

  return {
    pathname: src.slice(0, queryIndex),
    search: src.slice(queryIndex),
  };
}

function shouldProxyImagePath(pathname: string): boolean {
  if (!pathname.startsWith("/") || pathname.startsWith("/api/")) {
    return false;
  }

  return (
    isHeicImage(pathname) ||
    CONTENT_STUDIO_IMAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    isSupportedArtworkImage(pathname)
  );
}

export function getArtworkImageSrc(src: string): string {
  const { pathname, search } = splitImagePathAndSearch(src);
  const blobPath = isRemoteImageUrl(pathname) ? getBlobPathnameFromUrl(pathname) : null;

  if (blobPath) {
    return `/api/artwork-image/${blobPath}${search}`;
  }

  if (shouldProxyImagePath(pathname)) {
    return `/api/artwork-image/${pathname.slice(1)}${search}`;
  }

  return src;
}
