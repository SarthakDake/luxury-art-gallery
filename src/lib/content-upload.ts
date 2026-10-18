// Stores Content Studio uploads (artwork images, documents). Serverless
// functions on Vercel can't write into public/, so production uploads go to
// Vercel Blob whenever it's configured; local dev falls back to writing
// straight into public/ so files are servable without any external service.
import { get, put } from "@vercel/blob";
import { needsBrowserRasterization } from "@/lib/artwork-image";
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

async function assertBlobReadable(pathname: string): Promise<void> {
  const result = await get(pathname, { access: getBlobAccess() });
  if (!result || result.statusCode !== 200) {
    throw new Error(`Blob upload verification failed for ${pathname}`);
  }
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

  await assertBlobReadable(pathname);

  return toBlobVirtualPath(pathname);
}

/** Store a browser-friendly WebP alongside HEIC/TIFF originals in Blob. */
async function saveWebpDeliveryCopy(
  pathname: string,
  buffer: Buffer,
): Promise<string> {
  const { rasterizeForBrowserDisplay } = await import("@/lib/image-processing");
  const extension = path.extname(pathname).toLowerCase();
  const webpBytes = await rasterizeForBrowserDisplay(buffer, extension);
  const webpPathname = pathname.replace(/\.(heic|heif|tiff|tif|bmp)$/i, ".webp");

  await put(webpPathname, webpBytes, {
    access: getBlobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/webp",
  });

  await assertBlobReadable(webpPathname);

  return toBlobVirtualPath(webpPathname);
}

export function withImageCacheVersion(virtualPath: string): string {
  const separator = virtualPath.includes("?") ? "&" : "?";
  return `${virtualPath}${separator}v=${Date.now()}`;
}

/**
 * Persist the artist upload byte-for-byte (including HEIC/HEIF).
 * On Vercel Blob, HEIC/TIFF/BMP also get a verified WebP delivery copy; the
 * returned path points at WebP so storefront URLs stay browser-safe.
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

    await saveToBlob(pathname, original, contentType);

    if (needsBrowserRasterization(`file${options.extension}`)) {
      const webpVirtualPath = await saveWebpDeliveryCopy(pathname, original);
      return withImageCacheVersion(webpVirtualPath);
    }

    return withImageCacheVersion(toBlobVirtualPath(pathname));
  }

  // On Vercel there is no writable public/ to fall back to, so a missing
  // Blob config is a hard error rather than a silent local-disk write.
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

  // On Vercel there is no writable public/ to fall back to, so a missing
  // Blob config is a hard error rather than a silent local-disk write.
  if (process.env.VERCEL === "1") {
    throw new Error(
      "Vercel Blob is not configured. In the Vercel dashboard, open Storage → Create → Blob, connect it to this project, then redeploy.",
    );
  }

  const localPath = saveToLocalFilesystem(options.directory, filename, original);
  return withImageCacheVersion(localPath);
}
