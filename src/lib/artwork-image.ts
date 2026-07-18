import { getBlobPathnameFromUrl } from "@/lib/blob-storage";

/** Formats artists can upload and store as-is (including iPhone HEIC/HEIF). */
export const ARTWORK_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
  ".bmp",
] as const;

export type ArtworkImageExtension = (typeof ARTWORK_IMAGE_EXTENSIONS)[number];

/** Formats most browsers can display without server-side rasterization. */
const BROWSER_NATIVE_EXTENSIONS = new Set<ArtworkImageExtension>([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

export function getArtworkImageExtension(src: string): ArtworkImageExtension | null {
  const match = src.match(/(\.[a-z0-9]+)(?:\?.*)?$/i);
  if (!match) return null;

  const extension = match[1].toLowerCase() as ArtworkImageExtension;
  return ARTWORK_IMAGE_EXTENSIONS.includes(extension) ? extension : null;
}

export function isHeicImage(src: string): boolean {
  const extension = getArtworkImageExtension(src);
  return extension === ".heic" || extension === ".heif";
}

export function isGifImage(src: string): boolean {
  return getArtworkImageExtension(src) === ".gif";
}

/** True when the stored file needs on-the-fly conversion for web display. */
export function needsBrowserRasterization(src: string): boolean {
  const extension = getArtworkImageExtension(src);
  if (!extension) {
    return false;
  }
  return !BROWSER_NATIVE_EXTENSIONS.has(extension);
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
    needsBrowserRasterization(pathname) ||
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
