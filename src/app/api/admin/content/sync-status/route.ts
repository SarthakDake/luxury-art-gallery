import { authorizeAdminApi } from "@/lib/admin-api";
import { getContentMirrorStatus } from "@/lib/content-json-mirror";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authorizeAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  return Response.json({
    mirrors: getContentMirrorStatus(),
    requiredForProduction: {
      database: Boolean(process.env.DATABASE_URL),
      blobImages: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      githubJson:
        getContentMirrorStatus().github.configured ||
        Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    },
  });
}
