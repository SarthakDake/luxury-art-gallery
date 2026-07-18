import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { getBlobAccess, isBlobStorageEnabled, toBlobVirtualPath } from "@/lib/blob-storage";
import { toSafeBuffer } from "@/lib/buffer-utils";
import { getImageContentType } from "@/lib/image-format";

function saveToLocalFilesystem(
  directory: string,
  filename: string,
  buffer: Buffer,
): string {
  const safeName = path.basename(filename);
  const targetDir = path.join(process.cwd(), "public", directory);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, safeName), buffer);
  return directory
    ? `/${directory}/${safeName}`.replace(/\/+/g, "/")
    : `/${safeName}`;
}

async function saveToBlob(
  pathname: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const body = toSafeBuffer(buffer);

  await put(pathname, body, {
    access: getBlobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });

  return toBlobVirtualPath(pathname);
}

export function withImageCacheVersion(virtualPath: string): string {
  const separator = virtualPath.includes("?") ? "&" : "?";
  return `${virtualPath}${separator}v=${Date.now()}`;
}

/**
 * Persist the artist upload byte-for-byte (no format conversion or resize).
 * Web delivery optimization happens at request time via Next/Image + the
 * artwork-image proxy for non-browser formats (HEIC, TIFF, BMP).
 */
export async function uploadContentImage(options: {
  directory: string;
  filename: string;
  buffer: Buffer;
  extension: string;
}): Promise<string> {
  const filename = path.basename(options.filename);
  const contentType = getImageContentType(options.extension);
  const original = toSafeBuffer(options.buffer);

  if (isBlobStorageEnabled()) {
    const pathname = options.directory
      ? `${options.directory}/${filename}`
      : filename;

    const virtualPath = await saveToBlob(pathname, original, contentType);
    return withImageCacheVersion(virtualPath);
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Vercel Blob is not configured. In the Vercel dashboard, open Storage → Create → Blob, connect it to this project, then redeploy.",
    );
  }

  const localPath = saveToLocalFilesystem(options.directory, filename, original);
  return withImageCacheVersion(localPath);
}

/** Persist a PDF (or other non-image document) for CMS-managed downloads. */
export async function uploadContentDocument(options: {
  directory: string;
  filename: string;
  buffer: Buffer;
  contentType?: string;
}): Promise<string> {
  const filename = path.basename(options.filename);
  const contentType = options.contentType || "application/pdf";
  const original = toSafeBuffer(options.buffer);

  if (isBlobStorageEnabled()) {
    const pathname = options.directory
      ? `${options.directory}/${filename}`
      : filename;

    const virtualPath = await saveToBlob(pathname, original, contentType);
    return withImageCacheVersion(virtualPath);
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Vercel Blob is not configured. In the Vercel dashboard, open Storage → Create → Blob, connect it to this project, then redeploy.",
    );
  }

  const localPath = saveToLocalFilesystem(options.directory, filename, original);
  return withImageCacheVersion(localPath);
}
