import { ARTWORK_IMAGE_EXTENSIONS, type ArtworkImageExtension } from "@/lib/artwork-image";
import { getImageContentType } from "@/lib/image-format";
import {
  buildArtworkImageFilename,
  buildHeroFilename,
  buildPortraitFilename,
} from "@/lib/site-data/slug";

export type UploadKind =
  | "portrait"
  | "hero"
  | "cover"
  | "gallery"
  | "video-poster"
  | "artwork"
  | "document";

export const DOCUMENT_UPLOAD_EXTENSIONS = [".pdf"] as const;
export type DocumentUploadExtension = (typeof DOCUMENT_UPLOAD_EXTENSIONS)[number];

/** Prefer the server FormData route under this size — avoids flaky client Blob multipart for typical iPhone HEIC (~1–3MB). */
export const SERVER_UPLOAD_PREFERRED_MAX_BYTES = 4 * 1024 * 1024;

const MIME_TO_EXTENSION: Record<string, ArtworkImageExtension> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "image/tiff": ".tiff",
  "image/tif": ".tif",
  "image/bmp": ".bmp",
  "image/x-ms-bmp": ".bmp",
};

export const ALLOWED_UPLOAD_CONTENT_TYPES = Object.keys(MIME_TO_EXTENSION);

/** Resolve a Blob-safe MIME type even when the browser leaves File.type empty (common for HEIC). */
export function resolveUploadContentType(
  filename: string,
  mimeType?: string,
): string {
  const trimmed = mimeType?.trim();
  if (trimmed) {
    return trimmed;
  }

  const extension = resolveClientImageExtension(filename, mimeType);
  return extension ? getImageContentType(extension) : "application/octet-stream";
}

export function resolveClientImageExtension(
  filename: string,
  mimeType?: string,
): ArtworkImageExtension | null {
  const match = filename.match(/(\.[a-z0-9]+)$/i);
  if (match) {
    const extension = match[1].toLowerCase() as ArtworkImageExtension;
    if (ARTWORK_IMAGE_EXTENSIONS.includes(extension)) {
      return extension;
    }
  }

  if (mimeType) {
    return MIME_TO_EXTENSION[mimeType.trim().toLowerCase()] ?? null;
  }

  return null;
}

export function buildUploadPathname(options: {
  kind: UploadKind | string;
  slug: string;
  extension: ArtworkImageExtension;
  galleryIndex?: number;
  videoIndex?: number;
}): { directory: string; filename: string; pathname: string } {
  const kind = options.kind;

  if (kind === "portrait") {
    const filename = buildPortraitFilename(options.extension);
    return {
      directory: "portraits",
      filename,
      pathname: `portraits/${filename}`,
    };
  }

  if (kind === "hero") {
    const filename = buildHeroFilename(options.extension);
    return {
      directory: "site",
      filename,
      pathname: `site/${filename}`,
    };
  }

  if (kind === "document") {
    const slugBase = options.slug.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "document";
    const filename = `${slugBase}${options.extension}`;
    return {
      directory: "documents",
      filename,
      pathname: `documents/${filename}`,
    };
  }

  const filename =
    kind === "cover"
      ? buildArtworkImageFilename(options.slug, "cover", options.extension)
      : kind === "video-poster"
        ? buildArtworkImageFilename(
            options.slug,
            "video-poster",
            options.extension,
            options.videoIndex ?? 0,
          )
        : buildArtworkImageFilename(
            options.slug,
            "gallery",
            options.extension,
            options.galleryIndex ?? 0,
          );

  return {
    directory: "artworks",
    filename,
    pathname: `artworks/${filename}`,
  };
}

export function isAllowedUploadPathname(pathname: string): boolean {
  const normalized = pathname.replace(/^\/+/, "");
  if (
    normalized.includes("..") ||
    !(
      normalized.startsWith("artworks/") ||
      normalized.startsWith("portraits/") ||
      normalized.startsWith("site/") ||
      normalized.startsWith("documents/")
    )
  ) {
    return false;
  }

  const extension = normalized.match(/(\.[a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (!extension) {
    return false;
  }

  if (normalized.startsWith("documents/")) {
    return DOCUMENT_UPLOAD_EXTENSIONS.includes(
      extension as DocumentUploadExtension,
    );
  }

  return ARTWORK_IMAGE_EXTENSIONS.includes(extension as ArtworkImageExtension);
}

export function isPdfUpload(filename: string, mimeType?: string): boolean {
  const lowerName = filename.toLowerCase();
  const lowerMime = mimeType?.trim().toLowerCase() ?? "";
  return lowerName.endsWith(".pdf") || lowerMime === "application/pdf";
}
