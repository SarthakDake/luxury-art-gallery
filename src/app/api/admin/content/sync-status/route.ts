import { assertAdminSession } from "@/lib/admin";
import { getContentMirrorStatus } from "@/lib/content-json-mirror";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
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
