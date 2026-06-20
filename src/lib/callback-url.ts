const DEFAULT_CALLBACK_URL = "/profile";

export function sanitizeCallbackUrl(callbackUrl?: string | null) {
  if (!callbackUrl) {
    return DEFAULT_CALLBACK_URL;
  }

  if (
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    !callbackUrl.includes("://")
  ) {
    return callbackUrl;
  }

  return DEFAULT_CALLBACK_URL;
}
