import {
  ARTWORK_IMAGE_EXTENSIONS,
  type ArtworkImageExtension,
} from "@/lib/artwork-image";

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

export function isHeicBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) {
    return false;
  }

  const boxType = buffer.toString("ascii", 4, 8);
  if (boxType !== "ftyp") {
    return false;
  }

  const brand = buffer.toString("ascii", 8, 12).replace("\0", " ").trim();

  switch (brand) {
    case "mif1":
    case "msf1":
    case "heic":
    case "heix":
    case "hevc":
    case "hevx":
      return true;
    default:
      return false;
  }
}

function extensionFromFilename(filename: string): ArtworkImageExtension | null {
  const match = filename.match(/(\.[a-z0-9]+)$/i);
  if (!match) {
    return null;
  }

  const extension = match[1].toLowerCase() as ArtworkImageExtension;
  return ARTWORK_IMAGE_EXTENSIONS.includes(extension) ? extension : null;
}

function extensionFromMimeType(mimeType: string): ArtworkImageExtension | null {
  const normalized = mimeType.trim().toLowerCase();
  return MIME_TO_EXTENSION[normalized] ?? null;
}

function extensionFromBuffer(buffer: Buffer): ArtworkImageExtension | null {
  if (isHeicBuffer(buffer)) {
    return ".heic";
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return ".jpg";
  }

  if (
    buffer.length >= 8 &&
    buffer.toString("ascii", 0, 4) === "\x89PNG" &&
    buffer.toString("ascii", 4, 8) === "\r\n\x1a\n"
  ) {
    return ".png";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return ".webp";
  }

  if (buffer.length >= 6 && buffer.toString("ascii", 0, 6) === "GIF89a") {
    return ".gif";
  }

  if (buffer.length >= 6 && buffer.toString("ascii", 0, 6) === "GIF87a") {
    return ".gif";
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 4, 8) === "ftyp" &&
    buffer.toString("ascii", 8, 12).startsWith("avif")
  ) {
    return ".avif";
  }

  if (
    buffer.length >= 4 &&
    (buffer.toString("ascii", 0, 4) === "II*\0" || buffer.toString("ascii", 0, 4) === "MM\0*")
  ) {
    return ".tiff";
  }

  if (buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return ".bmp";
  }

  return null;
}

export function resolveUploadImageExtension(
  buffer: Buffer,
  filename: string,
  mimeType?: string,
): ArtworkImageExtension | null {
  const fromBuffer = extensionFromBuffer(buffer);
  if (fromBuffer) {
    return fromBuffer;
  }

  const fromName = extensionFromFilename(filename);
  if (fromName) {
    return fromName;
  }

  if (mimeType) {
    return extensionFromMimeType(mimeType);
  }

  return null;
}

export function isHeicExtension(extension: string): boolean {
  return extension === ".heic" || extension === ".heif";
}

export function getImageContentType(extension: string): string {
  switch (extension.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    case ".gif":
      return "image/gif";
    case ".heic":
      return "image/heic";
    case ".heif":
      return "image/heif";
    case ".tif":
    case ".tiff":
      return "image/tiff";
    case ".bmp":
      return "image/bmp";
    default:
      return "image/jpeg";
  }
}
