// Lazily-initialized singleton Razorpay SDK client, built from server-only
// env vars. Used for creating orders server-side; payment signature
// verification lives separately in src/app/api/verifyOrder/route.ts.
import Razorpay from "razorpay";

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured.");
  }

  // Cache the client across invocations (e.g. warm serverless instances)
  // instead of constructing a new SDK instance per request.
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
}
