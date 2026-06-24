export const ANALYTICS_CONSENT_KEY = "cnj-analytics-consent";

export type AnalyticsConsent = "accepted" | "declined";

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);

  if (value === "accepted" || value === "declined") {
    return value;
  }

  return null;
}

export function writeAnalyticsConsent(value: AnalyticsConsent) {
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
}
