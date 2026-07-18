import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { assertAdminSession } from "@/lib/admin";
import { isBlobStorageEnabled } from "@/lib/blob-storage";
import { isAllowedUploadPathname } from "@/lib/upload-path";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Issues client tokens so the browser can upload originals directly to Vercel Blob
 * (bypasses serverless request body limits for large iPhone photos).
 *
 * Content-type allowlists are intentionally omitted: iPhone HEIC/HEIF files often
 * arrive with an empty MIME type, and Blob's allowlist check rejects them even
 * when the pathname extension is valid. Pathname validation is enough here.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isBlobStorageEnabled()) {
    return Response.json(
      { error: "Direct blob uploads are not configured." },
      { status: 503 },
    );
  }

  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!isAllowedUploadPathname(pathname)) {
          throw new Error(
            "Invalid upload path. Use an artworks/ or portraits/ image path.",
          );
        }

        return {
          addRandomSuffix: false,
          allowOverwrite: true,
          // Client tokens default to a short TTL; large mobile uploads need more.
          validUntil: Date.now() + 30 * 60 * 1000,
        };
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error("[upload/blob] failed:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not authorize upload.",
      },
      { status: 400 },
    );
  }
}
