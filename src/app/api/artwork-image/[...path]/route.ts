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
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

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

const ALLOWED_IMAGE_ROOTS = ["artworks/", "portraits/", "site/"] as const;

function isAllowedImagePath(relativePath: string): boolean {
  const normalized = relativePath.replace(/^\/+/, "");
  const extension = path.extname(normalized).toLowerCase();
  const hasAllowedExtension = ARTWORK_IMAGE_EXTENSIONS.includes(
    extension as (typeof ARTWORK_IMAGE_EXTENSIONS)[number],
  );

  if (!hasAllowedExtension) {
    return false;
  }

  return ALLOWED_IMAGE_ROOTS.some(
    (root) => normalized === root.slice(0, -1) || normalized.startsWith(root),
  );
}

function getDeploymentOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return `https://${vercelHost}`;
  }

  return null;
}

/** Vercel serves `public/` on the CDN; lambdas often cannot read those bytes from disk. */
async function readFromDeploymentStaticAsset(
  relativePath: string,
): Promise<Buffer | null> {
  if (process.env.VERCEL !== "1") {
    return null;
  }

  const origin = getDeploymentOrigin();
  if (!origin) {
    return null;
  }

  try {
    const response = await fetch(`${origin}/${relativePath}`, {
      cache: "force-cache",
    });

    if (!response.ok) {
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error("[artwork-image] static asset fetch failed:", error);
    return null;
  }
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
    const { rasterizeForBrowserDisplay } = await import("@/lib/image-processing");
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

async function serveImageBytes(
  input: Buffer,
  extension: string,
  cacheControl: string,
): Promise<Response> {
  if (!needsBrowserRasterization(`file${extension}`)) {
    return new Response(new Uint8Array(input), {
      headers: {
        "Content-Type": getImageContentType(extension),
        "Cache-Control": cacheControl,
      },
    });
  }

  try {
    const { rasterizeForBrowserDisplay } = await import("@/lib/image-processing");
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

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const rateLimitResponse = await enforceRateLimit(request, "artwork-image");

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const cacheControl = getImageCacheControl(request);
    const { path: segments } = await context.params;
    const relativePath = segments.map((segment) => decodeURIComponent(segment)).join("/");

    if (!relativePath || relativePath.includes("..") || !isAllowedImagePath(relativePath)) {
      return new Response("Not found", { status: 404 });
    }

    const blobResponse = await streamFromBlob(relativePath, cacheControl);

    if (blobResponse) {
      return blobResponse;
    }

    const filePath = resolvePublicFile(relativePath);
    if (filePath) {
      const extension = path.extname(filePath).toLowerCase();
      const input = await readFile(filePath);
      return serveImageBytes(input, extension, cacheControl);
    }

    const staticBytes = await readFromDeploymentStaticAsset(relativePath);
    if (staticBytes) {
      const extension = path.extname(relativePath).toLowerCase();
      return serveImageBytes(staticBytes, extension, cacheControl);
    }

    return new Response("Not found", { status: 404 });
  } catch (error) {
    console.error("[artwork-image] unhandled error:", error);
    return new Response("Image unavailable", { status: 500 });
  }
}
