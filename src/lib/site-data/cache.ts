/** Next.js cache tags for on-demand revalidation after CMS saves. */
export const SITE_CONTENT_TAGS = {
  artworks: "site-content-artworks",
  config: "site-content-config",
  profile: "site-content-profile",
} as const;

/**
 * Fallback time-based ISR (seconds). Storefront stays fast via cache; if on-demand
 * revalidation is ever missed, pages self-refresh within this window.
 */
export const SITE_CONTENT_ISR_SECONDS = 3600;
