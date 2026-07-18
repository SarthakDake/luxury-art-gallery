import { assertAdminSession } from "@/lib/admin";
import { normalizeArtistProfile } from "@/lib/artist-profile";
import { getArtistProfile, summarizeMirrorResults, saveArtistProfile } from "@/lib/site-data";
import type { ArtistProfile } from "@/types/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ profile: await getArtistProfile() });
}

export async function PUT(request: Request) {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { profile?: ArtistProfile };

  try {
    payload = (await request.json()) as { profile?: ArtistProfile };
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload.profile) {
    return Response.json({ error: "profile object is required." }, { status: 400 });
  }

  const profile = normalizeArtistProfile(payload.profile);

  if (!profile.artistName || !profile.biography) {
    return Response.json(
      { error: "Artist name and biography are required." },
      { status: 400 },
    );
  }

  try {
    const mirrors = await saveArtistProfile(profile);
    const mirrorWarning = summarizeMirrorResults(mirrors);

    return Response.json({
      profile,
      mirrors,
      ...(mirrorWarning ? { mirrorWarning } : {}),
    });
  } catch (error) {
    console.error("[content] save profile failed:", error);
    return Response.json({ error: "Could not save artist profile." }, { status: 500 });
  }
}
