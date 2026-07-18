import { assertAdminSession } from "@/lib/admin";
import { getBlobAccess, isBlobStorageEnabled } from "@/lib/blob-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    directBlob: isBlobStorageEnabled(),
    access: getBlobAccess(),
  });
}
