import { get } from "@vercel/blob";
import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "path";
import {
  ARTWORK_IMAGE_EXTENSIONS,
  needsBrowserRasterization,
} from "@/lib/artwork-image";
import { getBlobAccess, isBlobStorageEnabled } from "@/lib/blob-storage";
import { getImageContentType } from "@/lib/image-format";
import { rasterizeForBrowserDisplay } from "@/lib/image-processing";
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

function isAllowedImagePath(relativePath: string): boolean {
  const extension = path.extname(relativePath).toLowerCase();

  return ARTWORK_IMAGE_EXTENSIONS.includes(
    extension as (typeof ARTWORK_IMAGE_EXTENSIONS)[number],
  );
}

function getImageCacheControl(request: Request): string {
  const version = new URL(request.url).searchParams.get("v");

  if (version) {
    return "public, max-age=31536000, immutable";
  }

  return "private, no-cache, no-store, must-revalidate";
}

async function streamFromBlob(
  relativePath: string,
  cacheControl: string,
): Promise<Response | null> {
  if (!isBlobStorageEnabled()) {
    return null;
  }

  try {
    const result = await get(relativePath, { access: getBlobAccess() });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return null;
    }

    const extension = path.extname(relativePath).toLowerCase();

    // Browser-native formats can stream as-is (Next/Image still resizes).
    if (!needsBrowserRasterization(`file${extension}`)) {
      return new Response(result.stream, {
        headers: {
          "Content-Type":
            result.blob.contentType ?? getImageContentType(extension),
          "Cache-Control": cacheControl,
        },
      });
    }

    const reader = result.stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (value) {
        chunks.push(value);
      }
    }

    const input = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
    const output = await rasterizeForBrowserDisplay(input, extension);

    return new Response(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": cacheControl,
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

  const cacheControl = getImageCacheControl(request);
  const { path: segments } = await context.params;
  const relativePath = path.posix.join(...segments);

  if (!relativePath || relativePath.includes("..") || !isAllowedImagePath(relativePath)) {
    return new Response("Not found", { status: 404 });
  }

  const blobResponse = await streamFromBlob(relativePath, cacheControl);

  if (blobResponse) {
    return blobResponse;
  }

  const filePath = resolvePublicFile(relativePath);

  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  const extension = path.extname(filePath).toLowerCase();
  const input = await readFile(filePath);

  if (!needsBrowserRasterization(`file${extension}`)) {
    return new Response(new Uint8Array(input), {
      headers: {
        "Content-Type": getImageContentType(extension),
        "Cache-Control": cacheControl,
      },
    });
  }

  try {
    const output = await rasterizeForBrowserDisplay(input, extension);
    return new Response(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": cacheControl,
      },
    });
  } catch (error) {
    console.error("[artwork-image] rasterization failed:", error);
    return new Response("Failed to convert image for display", { status: 500 });
  }
}
