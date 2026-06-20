import { assertAdminSession } from "@/lib/admin";
import { getArtistProfile, saveArtistProfile } from "@/lib/site-data";
import type { ArtistProfile } from "@/types/site-config";

export const dynamic = "force-dynamic";

function normalizeProfile(raw: ArtistProfile): ArtistProfile {
  return {
    artistName: raw.artistName.trim(),
    artistTagline: raw.artistTagline.trim(),
    portraitImageUrl: raw.portraitImageUrl.trim(),
    biography: raw.biography.trim(),
    exhibitions: (raw.exhibitions ?? [])
      .filter((entry) => entry.title.trim())
      .map((entry) => ({
        year: Number(entry.year),
        title: entry.title.trim(),
        location: entry.location.trim(),
      })),
    press: (raw.press ?? [])
      .filter((entry) => entry.publication.trim())
      .map((entry) => ({
        publication: entry.publication.trim(),
        year: Number(entry.year),
        link: entry.link.trim(),
      })),
  };
}

export async function GET() {
  try {
    await assertAdminSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ profile: getArtistProfile() });
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

  const profile = normalizeProfile(payload.profile);

  if (!profile.artistName || !profile.biography) {
    return Response.json(
      { error: "Artist name and biography are required." },
      { status: 400 },
    );
  }

  try {
    saveArtistProfile(profile);
  } catch (error) {
    console.error("[content] save profile failed:", error);
    return Response.json({ error: "Could not save artist profile." }, { status: 500 });
  }

  return Response.json({ profile });
}
