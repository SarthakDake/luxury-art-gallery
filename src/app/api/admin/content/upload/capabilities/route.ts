import { authorizeAdminApi } from "@/lib/admin-api";
import { getBlobAccess, isBlobStorageEnabled } from "@/lib/blob-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authorizeAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  return Response.json({
    directBlob: isBlobStorageEnabled(),
    access: getBlobAccess(),
  });
}
