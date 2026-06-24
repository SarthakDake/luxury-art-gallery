"use client";

import {
  readAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics-consent";
import { useSyncExternalStore } from "react";

const CONSENT_EVENT = "analytics-consent-change";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(CONSENT_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(CONSENT_EVENT, handleChange);
  };
}

function getServerSnapshot() {
  return null;
}

export function notifyAnalyticsConsentChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }
}

export function useAnalyticsConsent() {
  return useSyncExternalStore(
    subscribe,
    readAnalyticsConsent,
    getServerSnapshot,
  );
}

export type { AnalyticsConsent };
