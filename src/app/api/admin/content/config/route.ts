import { assertAdminSession } from "@/lib/admin";
import { normalizeSiteConfig } from "@/lib/site-config";
import { getSiteConfig, summarizeMirrorResults, saveSiteConfig } from "@/lib/site-data";
import type { SiteConfig } from "@/types/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ config: await getSiteConfig() });
}

export async function PUT(request: Request) {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { config?: SiteConfig };

  try {
    payload = (await request.json()) as { config?: SiteConfig };
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload.config) {
    return Response.json({ error: "config object is required." }, { status: 400 });
  }

  const config = normalizeSiteConfig(payload.config);

  if (!config.siteName || !config.contactEmail) {
    return Response.json(
      { error: "Site name and contact email are required." },
      { status: 400 },
    );
  }

  try {
    const mirrors = await saveSiteConfig(config);
    const mirrorWarning = summarizeMirrorResults(mirrors);

    return Response.json({
      config,
      mirrors,
      ...(mirrorWarning ? { mirrorWarning } : {}),
    });
  } catch (error) {
    console.error("[content] save config failed:", error);
    return Response.json({ error: "Could not save site settings." }, { status: 500 });
  }
}
