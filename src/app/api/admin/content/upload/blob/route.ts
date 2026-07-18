import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { assertAdminSession } from "@/lib/admin";
import { getBlobAccess, isBlobStorageEnabled } from "@/lib/blob-storage";
import {
  ALLOWED_UPLOAD_CONTENT_TYPES,
  isAllowedUploadPathname,
} from "@/lib/upload-path";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Issues client tokens so the browser can upload originals directly to Vercel Blob
 * (bypasses serverless request body limits for large iPhone photos).
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
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: ALLOWED_UPLOAD_CONTENT_TYPES,
          // No app-level byte cap — artists may upload full-resolution originals.
          addRandomSuffix: false,
          allowOverwrite: true,
          tokenPayload: JSON.stringify({ access: getBlobAccess() }),
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
