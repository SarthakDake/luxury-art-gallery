/**
 * Local-only bypass so Content Studio can be opened while developing.
 *
 * Enabled when:
 * - running `next dev` (NODE_ENV=development), or
 * - ALLOW_LOCAL_ADMIN / NEXT_PUBLIC_ALLOW_LOCAL_ADMIN is "true"
 *
 * Never enabled on Vercel production (VERCEL_ENV=production).
 */
export function isLocalAdminBypassEnabled(): boolean {
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }

  if (
    process.env.ALLOW_LOCAL_ADMIN === "true" ||
    process.env.NEXT_PUBLIC_ALLOW_LOCAL_ADMIN === "true"
  ) {
    return true;
  }

  return process.env.NODE_ENV === "development";
}
