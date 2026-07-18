import { toPublicSiteConfig } from "@/lib/site-config";
import { getSiteConfig } from "@/lib/site-data";
import { STOREFRONT_API_CACHE_CONTROL } from "@/lib/storefront-cache";

/** Public site config (brand tokens, homepage, feature flags). Omits adminEmail. */
export async function GET() {
  const config = await getSiteConfig();

  return Response.json(
    { config: toPublicSiteConfig(config) },
    {
      headers: {
        "Cache-Control": STOREFRONT_API_CACHE_CONTROL,
      },
    },
  );
}
