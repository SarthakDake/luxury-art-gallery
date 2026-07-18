/**
 * Local-only bypass so Content Studio can be opened while developing.
 *
 * Enabled when:
 * - running `next dev` on a non-Vercel machine (NODE_ENV=development), or
 * - ALLOW_LOCAL_ADMIN is explicitly "true" (never auto-enable on Vercel)
 *
 * Never enabled on Vercel production. Preview/staging must set ALLOW_LOCAL_ADMIN
 * deliberately — do not rely on NEXT_PUBLIC_* for auth bypass.
 */
export function isLocalAdminBypassEnabled(): boolean {
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }

  if (process.env.ALLOW_LOCAL_ADMIN === "true") {
    return true;
  }

  // Auto-enable only for local `next dev`, never on Vercel deployments.
  if (process.env.VERCEL) {
    return false;
  }

  return process.env.NODE_ENV === "development";
}
