import {
  isPhonePeConfigured,
  isRazorpayConfigured,
  resolvePaymentGateway,
} from "@/lib/payments/gateway";

export function getPublicPaymentConfig() {
  const gateway = resolvePaymentGateway();

  return {
    gateway,
    razorpayEnabled: isRazorpayConfigured(),
    phonepeEnabled: isPhonePeConfigured(),
    activeGateway: gateway,
  };
}
