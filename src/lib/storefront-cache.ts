/**
 * Short CDN cache for JSON feeds used by client widgets (search).
 * CMS saves invalidate the underlying data cache and this route via revalidatePath.
 */
export const STOREFRONT_API_CACHE_CONTROL =
  "public, s-maxage=60, stale-while-revalidate=300";
