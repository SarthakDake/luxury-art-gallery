"use client";

import { writeAnalyticsConsent, type AnalyticsConsent } from "@/lib/analytics-consent";
import {
  notifyAnalyticsConsentChange,
  useAnalyticsConsent,
} from "@/hooks/use-analytics-consent";

export function CookieConsent() {
  const consent = useAnalyticsConsent();
  const visible = consent === null;

  function handleChoice(nextConsent: AnalyticsConsent) {
    writeAnalyticsConsent(nextConsent);
    notifyAnalyticsConsentChange();
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="cookie-consent-inner">
        <div className="cookie-consent-copy">
          <p id="cookie-consent-title" className="cookie-consent-title">
            Privacy & analytics
          </p>
          <p id="cookie-consent-description" className="cookie-consent-description">
            We use privacy-friendly analytics to understand site performance. You can
            accept or decline optional analytics cookies.
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button
            type="button"
            className="btn-secondary btn-responsive"
            onClick={() => handleChoice("declined")}
          >
            Decline
          </button>
          <button
            type="button"
            className="btn-primary btn-responsive"
            onClick={() => handleChoice("accepted")}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
