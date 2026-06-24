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

function shouldProxyImagePath(src: string): boolean {
  if (!src.startsWith("/") || src.startsWith("/api/")) {
    return false;
  }

  return (
    isHeicImage(src) ||
    CONTENT_STUDIO_IMAGE_PREFIXES.some((prefix) => src.startsWith(prefix)) ||
    isSupportedArtworkImage(src)
  );
}

export function getArtworkImageSrc(src: string): string {
  const blobPath = isRemoteImageUrl(src) ? getBlobPathnameFromUrl(src) : null;

  if (blobPath) {
    return `/api/artwork-image/${blobPath}`;
  }

  if (shouldProxyImagePath(src)) {
    return `/api/artwork-image/${src.slice(1)}`;
  }

  return src;
}
