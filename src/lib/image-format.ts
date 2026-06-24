import {
  ARTWORK_IMAGE_EXTENSIONS,
  type ArtworkImageExtension,
} from "@/lib/artwork-image";

const MIME_TO_EXTENSION: Record<string, ArtworkImageExtension> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
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
