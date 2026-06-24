"use client";

import { useAnalyticsConsent } from "@/hooks/use-analytics-consent";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieConsent } from "./CookieConsent";

export function ConditionalAnalytics() {
  const consent = useAnalyticsConsent();

  return (
    <>
      {consent === "accepted" ? (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}
      <CookieConsent />
    </>
  );
}
