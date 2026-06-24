import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { getBlobAccess, isBlobStorageEnabled, toBlobVirtualPath } from "@/lib/blob-storage";
import { normalizeImageToWebp } from "@/lib/image-processing";

function getContentType(extension: string): string {
  switch (extension) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}

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
  await put(pathname, buffer, {
    access: getBlobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });

  return toBlobVirtualPath(pathname);
}

function replaceExtension(filename: string, extension: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base}${extension}`;
}

export function withImageCacheVersion(virtualPath: string): string {
  const separator = virtualPath.includes("?") ? "&" : "?";
  return `${virtualPath}${separator}v=${Date.now()}`;
}

export async function uploadContentImage(options: {
  directory: string;
  filename: string;
  buffer: Buffer;
  extension: string;
}): Promise<string> {
  const normalized = await normalizeImageToWebp(options.buffer, options.extension);
  const filename = replaceExtension(options.filename, normalized.extension);

  if (isBlobStorageEnabled()) {
    const pathname = options.directory
      ? `${options.directory}/${path.basename(filename)}`
      : path.basename(filename);

    const virtualPath = await saveToBlob(
      pathname,
      normalized.buffer,
      getContentType(normalized.extension),
    );
    return withImageCacheVersion(virtualPath);
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Vercel Blob is not configured. In the Vercel dashboard, open Storage → Create → Blob, connect it to this project, then redeploy.",
    );
  }

  const localPath = saveToLocalFilesystem(
    options.directory,
    filename,
    normalized.buffer,
  );
  return withImageCacheVersion(localPath);
}
