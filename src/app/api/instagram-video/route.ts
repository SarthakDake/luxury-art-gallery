import { fetchInstagramVideoUrl } from "@/lib/instagram-video";
import { extractInstagramEmbedPath } from "@/lib/artwork-video";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(request, "instagram-video");

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const postUrl = request.nextUrl.searchParams.get("url")?.trim();

  if (!postUrl || !extractInstagramEmbedPath(postUrl)) {
    return NextResponse.json(
      { error: "A valid Instagram post URL is required." },
      { status: 400 },
    );
  }

  try {
    const videoUrl = await fetchInstagramVideoUrl(postUrl);

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Could not resolve an Instagram video stream." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { videoUrl },
      {
        headers: {
          "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Instagram video." },
      { status: 502 },
    );
  }
}
