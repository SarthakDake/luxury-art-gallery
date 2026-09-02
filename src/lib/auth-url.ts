/**
 * Canonical public site URL for NextAuth, payments, and redirects.
 *
 * On Vercel with a Cloudflare custom domain, always set NEXTAUTH_URL (and
 * NEXT_PUBLIC_APP_URL) to your live domain — not the *.vercel.app hostname.
 */
export function getSiteUrl() {
  // Explicit env vars win, in this priority order, but a "localhost" value
  // is deliberately skipped even if set — that only happens when a .env
  // file meant for local dev leaks into a deployed environment, and we'd
  // rather fall through to a real Vercel host than build broken links.
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

  // PRODUCTION_URL (the stable production domain) is preferred over
  // VERCEL_URL (the per-deployment URL, which changes on every deploy and
  // would break magic-link emails sent from an old deployment).
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  // Preview deployments only get VERCEL_URL — no stable production domain.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Last resort: plain local dev with nothing configured.
  return "http://localhost:3001";
}

/** @deprecated Use getSiteUrl */
export function getAuthBaseUrl() {
  return getSiteUrl();
}

export function getGoogleOAuthCallbackUrl() {
  return `${getSiteUrl()}/api/auth/callback/google`;
}

// Mutates process.env so NextAuth (which reads these vars internally,
// outside our control) sees the resolved values. Must be called before
// NextAuth initializes — see the call site in src/lib/auth.ts.
export function ensureAuthEnv() {
  const baseUrl = getSiteUrl();

  // Same localhost-leak guard as getSiteUrl: never let a stray localhost
  // NEXTAUTH_URL survive into a deployed environment.
  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost")) {
    process.env.NEXTAUTH_URL = baseUrl;
  }

  // Vercel deployments sit behind a proxy that rewrites Host headers, so
  // NextAuth must trust the forwarded host instead of rejecting it.
  if (process.env.VERCEL && !process.env.AUTH_TRUST_HOST) {
    process.env.AUTH_TRUST_HOST = "true";
  }
}
