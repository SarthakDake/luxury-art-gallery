import { get } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { ARTWORK_IMAGE_EXTENSIONS } from "@/lib/artwork-image";
import { getBlobAccess, isBlobStorageEnabled } from "@/lib/blob-storage";
import { convertHeicToPng } from "@/lib/heic-to-image";
import { enforceRateLimit } from "@/lib/rate-limit";

const PUBLIC_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
);

function resolvePublicFile(relativePath: string): string | null {
  const normalized = path.posix.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const resolved = path.resolve(PUBLIC_DIR, normalized);

  if (!resolved.startsWith(PUBLIC_DIR)) {
    return null;
  }

  if (fs.existsSync(resolved)) {
    return resolved;
  }

  const parentDir = path.dirname(resolved);
  const filename = path.basename(resolved);

  if (!fs.existsSync(parentDir)) {
    return null;
  }

  const match = fs
    .readdirSync(parentDir)
    .find((entry) => entry.toLowerCase() === filename.toLowerCase());

  return match ? path.join(parentDir, match) : null;
}

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

function isAllowedImagePath(relativePath: string): boolean {
  const extension = path.extname(relativePath).toLowerCase();

  return ARTWORK_IMAGE_EXTENSIONS.includes(
    extension as (typeof ARTWORK_IMAGE_EXTENSIONS)[number],
  );
}

async function readFromBlob(relativePath: string): Promise<Response | null> {
  if (!isBlobStorageEnabled()) {
    return null;
  }

  try {
    const result = await get(relativePath, { access: getBlobAccess() });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return null;
    }

    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType ?? getContentType(path.extname(relativePath)),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[artwork-image] blob fetch failed:", error);
    return null;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const rateLimitResponse = await enforceRateLimit(request, "artwork-image");

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { path: segments } = await context.params;
  const relativePath = path.posix.join(...segments);

  if (!relativePath || relativePath.includes("..") || !isAllowedImagePath(relativePath)) {
    return new Response("Not found", { status: 404 });
  }

  const blobResponse = await readFromBlob(relativePath);

  if (blobResponse) {
    return blobResponse;
  }

  const filePath = resolvePublicFile(relativePath);

  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  const extension = path.extname(filePath).toLowerCase();
  const input = fs.readFileSync(filePath);
  const shouldConvert = extension === ".heic" || extension === ".heif";

  let output: Buffer;

  if (shouldConvert) {
    try {
      output = await convertHeicToPng(input);
    } catch (error) {
      console.error("HEIC conversion failed:", error);
      return new Response("Failed to convert image", { status: 500 });
    }
  } else {
    output = input;
  }

  return new Response(new Uint8Array(output), {
    headers: {
      "Content-Type": getContentType(extension),
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
