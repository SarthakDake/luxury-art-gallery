export type PaymentGateway = "razorpay" | "phonepe";

export function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  );
}

export function isPhonePeConfigured() {
  const hasSdkCredentials =
    process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_SECRET;

  const hasLegacyCredentials =
    process.env.PHONEPE_MERCHANT_ID && process.env.PHONEPE_SALT_KEY;

  return Boolean(hasSdkCredentials || hasLegacyCredentials);
}

export function resolvePaymentGateway(): PaymentGateway | null {
  if (isRazorpayConfigured()) {
    return "razorpay";
  }

  if (isPhonePeConfigured()) {
    return "phonepe";
  }

  return null;
}

export function getAppBaseUrl() {
  return (
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3001"
  );
}
