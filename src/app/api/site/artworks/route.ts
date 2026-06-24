import { getArtworks } from "@/lib/site-data";
import { STOREFRONT_API_CACHE_CONTROL } from "@/lib/storefront-cache";

export async function GET() {
  const artworks = await getArtworks();

  return Response.json(
    { artworks },
    {
      headers: {
        "Cache-Control": STOREFRONT_API_CACHE_CONTROL,
      },
    },
  );
}
