import { get, put } from "@vercel/blob";
import { authorizeAdminApi } from "@/lib/admin-api";
import { needsBrowserRasterization } from "@/lib/artwork-image";
import {
  getBlobAccess,
  isBlobStorageEnabled,
  toBlobVirtualPath,
} from "@/lib/blob-storage";
import { withImageCacheVersion } from "@/lib/content-upload";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Build a verified WebP delivery copy for an existing Blob HEIC/TIFF upload. */
export async function POST(request: Request) {
  const auth = await authorizeAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  if (!isBlobStorageEnabled()) {
    return Response.json({ error: "Blob storage is not configured." }, { status: 503 });
  }

  let pathname = "";

  try {
    const body = (await request.json()) as { pathname?: string };
    pathname = (body.pathname ?? "").replace(/^\/+/, "");
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!pathname || pathname.includes("..") || !needsBrowserRasterization(`file${pathname}`)) {
    return Response.json({ error: "Invalid or unsupported pathname." }, { status: 400 });
  }

  try {
    const access = getBlobAccess();
    const blob = await get(pathname, { access });

    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return Response.json({ error: "Original blob object not found." }, { status: 404 });
    }

    const reader = blob.stream.getReader();
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
    const extension = pathname.slice(pathname.lastIndexOf(".")).toLowerCase();
    const { rasterizeForBrowserDisplay } = await import("@/lib/image-processing");
    const webpBytes = await rasterizeForBrowserDisplay(input, extension);
    const webpPathname = pathname.replace(/\.(heic|heif|tiff|tif|bmp)$/i, ".webp");

    await put(webpPathname, webpBytes, {
      access,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "image/webp",
    });

    const verify = await get(webpPathname, { access });
    if (!verify || verify.statusCode !== 200) {
      throw new Error("WebP delivery copy verification failed.");
    }

    return Response.json({
      path: withImageCacheVersion(toBlobVirtualPath(webpPathname)),
    });
  } catch (error) {
    console.error("[upload/derive-delivery] failed:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not derive delivery image." },
      { status: 500 },
    );
  }
}
