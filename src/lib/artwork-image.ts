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

export function getArtworkImageSrc(src: string): string {
  if (!src.startsWith("/")) {
    return src;
  }

  if (isHeicImage(src)) {
    return `/api/artwork-image/${src.slice(1)}`;
  }

  return src;
}
