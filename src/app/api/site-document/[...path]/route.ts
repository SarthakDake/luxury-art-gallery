import { get } from "@vercel/blob";
import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "path";
import { getBlobAccess, isBlobStorageEnabled } from "@/lib/blob-storage";
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

  return null;
}

function isAllowedDocumentPath(relativePath: string): boolean {
  const normalized = relativePath.replace(/^\/+/, "");
  return (
    normalized.startsWith("documents/") &&
    normalized.toLowerCase().endsWith(".pdf") &&
    !normalized.includes("..")
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const rateLimitResponse = await enforceRateLimit(request, "site-document");
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { path: segments } = await context.params;
  const relativePath = segments.map(decodeURIComponent).join("/");

  if (!isAllowedDocumentPath(relativePath)) {
    return new Response("Not found", { status: 404 });
  }

  const version = new URL(request.url).searchParams.get("v");
  const cacheControl = version
    ? "public, max-age=31536000, immutable"
    : "private, no-cache, no-store, must-revalidate";

  const download = new URL(request.url).searchParams.get("download") === "1";
  const filename =
    new URL(request.url).searchParams.get("filename") ||
    path.basename(relativePath);

  function pdfHeaders(): Headers {
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Cache-Control", cacheControl);
    headers.set(
      "Content-Disposition",
      download
        ? `attachment; filename="${filename.replace(/"/g, "")}"`
        : `inline; filename="${filename.replace(/"/g, "")}"`,
    );
    // Belt-and-suspenders with next.config: allow same-origin iframe embed.
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Content-Security-Policy", "frame-ancestors 'self'");
    return headers;
  }

  if (isBlobStorageEnabled()) {
    try {
      const result = await get(relativePath, { access: getBlobAccess() });
      if (!result || !result.stream) {
        return new Response("Not found", { status: 404 });
      }

      return new Response(result.stream, { status: 200, headers: pdfHeaders() });
    } catch (error) {
      console.error("[site-document] blob read failed:", error);
      return new Response("Not found", { status: 404 });
    }
  }

  const localFile = resolvePublicFile(relativePath);
  if (!localFile) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = await readFile(localFile);
  return new Response(bytes, {
    status: 200,
    headers: pdfHeaders(),
  });
}
