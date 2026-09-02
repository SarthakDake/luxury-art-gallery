// Central place that decides which payment gateway checkout should use,
// based purely on which provider's env vars are present. No gateway is
// ever hardcoded — if neither is configured, callers fall back to the
// WhatsApp manual checkout flow.
export type PaymentGateway = "razorpay" | "phonepe";

export function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  );
}

export function isPhonePeConfigured() {
  // PhonePe supports two integration modes: the newer OAuth-style SDK
  // (CLIENT_ID/SECRET) and the legacy checksum/salt API (MERCHANT_ID/SALT_KEY).
  // Either set of credentials is sufficient; see phonepe.ts for the branching.
  const hasSdkCredentials =
    process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_SECRET;

  const hasLegacyCredentials =
    process.env.PHONEPE_MERCHANT_ID && process.env.PHONEPE_SALT_KEY;

  return Boolean(hasSdkCredentials || hasLegacyCredentials);
}

export function resolvePaymentGateway(): PaymentGateway | null {
  // Razorpay takes priority when both are configured. This is an arbitrary
  // but deliberate precedence, not a fallback-on-failure mechanism — only
  // one gateway is ever active for checkout at a time.
  if (isRazorpayConfigured()) {
    return "razorpay";
  }

  if (isPhonePeConfigured()) {
    return "phonepe";
  }

  return null;
}

import { getSiteUrl } from "@/lib/auth-url";

export function getAppBaseUrl() {
  return getSiteUrl();
}
