import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { convertHeicToPng } from "@/lib/heic-to-image";

function getContentType(extension: string): string {
  switch (extension) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".heic":
    case ".heif":
      return "image/png";
    default:
      return "image/jpeg";
  }
}

function shouldUseBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
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
  return `/${directory}/${safeName}`.replace(/\/+/g, "/");
}

async function saveToBlob(
  pathname: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const blob = await put(pathname, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType,
  });

  return blob.url;
}

async function normalizeUploadBuffer(
  buffer: Buffer,
  extension: string,
): Promise<{ buffer: Buffer; extension: string }> {
  if ((extension === ".heic" || extension === ".heif") && shouldUseBlobStorage()) {
    const png = await convertHeicToPng(buffer);
    return { buffer: png, extension: ".png" };
  }

  return { buffer, extension };
}

function replaceExtension(filename: string, extension: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return `${base}${extension}`;
}

export async function uploadContentImage(options: {
  directory: string;
  filename: string;
  buffer: Buffer;
  extension: string;
}): Promise<string> {
  const normalized = await normalizeUploadBuffer(options.buffer, options.extension);
  const filename =
    normalized.extension === options.extension
      ? options.filename
      : replaceExtension(options.filename, normalized.extension);

  if (shouldUseBlobStorage()) {
    const pathname = options.directory
      ? `${options.directory}/${path.basename(filename)}`
      : path.basename(filename);

    return saveToBlob(
      pathname,
      normalized.buffer,
      getContentType(normalized.extension),
    );
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Vercel Blob is not configured. In the Vercel dashboard, open Storage → Create → Blob, connect it to this project, then redeploy.",
    );
  }

  return saveToLocalFilesystem(options.directory, filename, normalized.buffer);
}
