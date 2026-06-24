import { getArtworks } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ artworks: await getArtworks() });
}
