/**
 * Canonical public site URL for NextAuth, payments, and redirects.
 *
 * On Vercel with a Cloudflare custom domain, always set NEXTAUTH_URL (and
 * NEXT_PUBLIC_APP_URL) to your live domain — not the *.vercel.app hostname.
 */
export function getSiteUrl() {
  const candidates = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.SITE_URL,
  ];

  for (const value of candidates) {
    const normalized = value?.trim().replace(/\/$/, "");
    if (normalized && !normalized.includes("localhost")) {
      return normalized;
    }
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3001";
}

/** @deprecated Use getSiteUrl */
export function getAuthBaseUrl() {
  return getSiteUrl();
}

export function getGoogleOAuthCallbackUrl() {
  return `${getSiteUrl()}/api/auth/callback/google`;
}

export function ensureAuthEnv() {
  const baseUrl = getSiteUrl();

  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost")) {
    process.env.NEXTAUTH_URL = baseUrl;
  }

  if (process.env.VERCEL && !process.env.AUTH_TRUST_HOST) {
    process.env.AUTH_TRUST_HOST = "true";
  }
}
