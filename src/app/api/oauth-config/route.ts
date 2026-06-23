import { getGoogleOAuthCallbackUrl, getSiteUrl } from "@/lib/auth-url";

export const dynamic = "force-dynamic";

/** Public helper — shows which OAuth callback URL this deployment uses. */
export async function GET() {
  const siteUrl = getSiteUrl();

  return Response.json({
    siteUrl,
    googleCallbackUrl: getGoogleOAuthCallbackUrl(),
    googleJavaScriptOrigin: siteUrl,
    hint:
      "Add googleCallbackUrl exactly under Google Cloud Console → APIs & Services → Credentials → your OAuth client → Authorized redirect URIs. Add googleJavaScriptOrigin under Authorized JavaScript origins.",
  });
}
