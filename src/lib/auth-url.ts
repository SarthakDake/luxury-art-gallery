/**
 * Resolve the canonical site URL for NextAuth in local, preview, and production.
 */
export function getAuthBaseUrl() {
  const configured = process.env.NEXTAUTH_URL?.replace(/\/$/, "");

  if (configured && !configured.includes("localhost")) {
    return configured;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return configured ?? "http://localhost:3001";
}

export function ensureAuthEnv() {
  const baseUrl = getAuthBaseUrl();

  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost")) {
    process.env.NEXTAUTH_URL = baseUrl;
  }

  if (process.env.VERCEL && !process.env.AUTH_TRUST_HOST) {
    process.env.AUTH_TRUST_HOST = "true";
  }
}
