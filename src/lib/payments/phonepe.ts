// PhonePe payment integration. Supports two parallel integration modes that
// are selected purely by which env vars are present (see isPhonePeConfigured
// in gateway.ts): the newer OAuth-style SDK (PHONEPE_CLIENT_ID/SECRET) and
// the legacy checksum/salt REST API (PHONEPE_MERCHANT_ID/SALT_KEY). Whichever
// mode initiated a payment must also be used to verify it later.
import { createHash } from "node:crypto";
import { getAppBaseUrl } from "@/lib/payments/gateway";

interface PhonePePayResult {
  redirectUrl: string;
  merchantOrderId: string;
}

// PhonePe uses separate hostnames for sandbox and production; PHONEPE_ENV
// must be flipped to "production" deliberately before going live.
function getPhonePeBaseUrl() {
  return process.env.PHONEPE_ENV === "production"
    ? "https://api.phonepe.com/apis/hermes"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox";
}

// Legacy PhonePe API auth: proves the request came from us (not a tampered
// client) by hashing the payload + API path with a shared secret salt key
// that only we and PhonePe know. The salt index tells PhonePe which of
// their salt keys (they can be rotated) was used, so it must be appended
// verbatim after the hash.
function createLegacyChecksum(payloadBase64: string, apiPath: string) {
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX ?? "1";

  if (!saltKey) {
    throw new Error("PhonePe salt key is not configured.");
  }

  const digest = createHash("sha256")
    .update(`${payloadBase64}${apiPath}${saltKey}`)
    .digest("hex");

  return `${digest}###${saltIndex}`;
}

// Initiates a payment via PhonePe's legacy checksum-based /pg/v1/pay API:
// build the payload, base64-encode it, sign it with the salt key, and let
// PhonePe host the actual payment page (we only get a redirect URL back).
async function createLegacyPhonePePayment({
  merchantOrderId,
  amountInPaise,
  userId,
  orderId,
}: {
  merchantOrderId: string;
  amountInPaise: number;
  userId: string;
  orderId: string;
}): Promise<PhonePePayResult> {
  const merchantId = process.env.PHONEPE_MERCHANT_ID;

  if (!merchantId) {
    throw new Error("PhonePe merchant ID is not configured.");
  }

  const redirectUrl = `${getAppBaseUrl()}/api/phonepe/callback?orderId=${encodeURIComponent(orderId)}`;
  const callbackUrl = `${getAppBaseUrl()}/api/phonepe/webhook`;

  const payload = {
    merchantId,
    merchantTransactionId: merchantOrderId,
    merchantUserId: userId,
    amount: amountInPaise,
    redirectUrl,
    redirectMode: "REDIRECT",
    callbackUrl,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const apiPath = "/pg/v1/pay";
  const checksum = createLegacyChecksum(payloadBase64, apiPath);

  const response = await fetch(`${getPhonePeBaseUrl()}${apiPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-VERIFY": checksum,
    },
    body: JSON.stringify({ request: payloadBase64 }),
  });

  const data = (await response.json()) as {
    success?: boolean;
    code?: string;
    message?: string;
    data?: {
      instrumentResponse?: {
        redirectInfo?: {
          url?: string;
        };
      };
    };
  };

  if (!response.ok || !data.success) {
    throw new Error(data.message ?? "PhonePe payment initiation failed.");
  }

  const redirectInfoUrl = data.data?.instrumentResponse?.redirectInfo?.url;

  if (!redirectInfoUrl) {
    throw new Error("PhonePe did not return a redirect URL.");
  }

  return {
    redirectUrl: redirectInfoUrl,
    merchantOrderId,
  };
}

// Initiates a payment via the newer PhonePe SDK, which handles its own
// OAuth-style client token exchange and request signing internally — no
// manual checksum computation needed here, unlike the legacy path below.
async function createSdkPhonePePayment({
  merchantOrderId,
  amountInPaise,
  orderId,
}: {
  merchantOrderId: string;
  amountInPaise: number;
  orderId: string;
}): Promise<PhonePePayResult> {
  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PhonePe SDK credentials are not configured.");
  }

  const { Env, StandardCheckoutClient, StandardCheckoutPayRequest } =
    await import("@phonepe-pg/pg-sdk-node");

  const clientVersion = Number(process.env.PHONEPE_CLIENT_VERSION ?? "1");
  const env =
    process.env.PHONEPE_ENV === "production" ? Env.PRODUCTION : Env.SANDBOX;

  const client = StandardCheckoutClient.getInstance(
    clientId,
    clientSecret,
    clientVersion,
    env,
  );

  const redirectUrl = `${getAppBaseUrl()}/api/phonepe/callback?orderId=${encodeURIComponent(orderId)}`;

  const request = StandardCheckoutPayRequest.builder()
    .merchantOrderId(merchantOrderId)
    .amount(amountInPaise)
    .redirectUrl(redirectUrl)
    .build();

  const response = await client.pay(request);

  if (!response.redirectUrl) {
    throw new Error("PhonePe SDK did not return a redirect URL.");
  }

  return {
    redirectUrl: response.redirectUrl,
    merchantOrderId,
  };
}

export async function createPhonePePayment(input: {
  orderId: string;
  amountInPaise: number;
  userId: string;
}): Promise<PhonePePayResult> {
  // Suffixed with Date.now() so retried checkout attempts for the same
  // order get a fresh merchantOrderId rather than colliding with a
  // previous (possibly still-pending) PhonePe transaction.
  const merchantOrderId = `cnj_${input.orderId.slice(-12)}_${Date.now()}`;

  // SDK credentials, if present, take priority over legacy salt-based auth.
  if (process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_SECRET) {
    return createSdkPhonePePayment({
      merchantOrderId,
      amountInPaise: input.amountInPaise,
      orderId: input.orderId,
    });
  }

  return createLegacyPhonePePayment({
    merchantOrderId,
    amountInPaise: input.amountInPaise,
    userId: input.userId,
    orderId: input.orderId,
  });
}

// Server-side status check against PhonePe (not client-reported) — used as
// the source of truth for whether an order actually got paid. Must use the
// same integration mode (SDK vs legacy) that initiated the payment.
export async function verifyPhonePePayment(merchantOrderId: string) {
  if (process.env.PHONEPE_CLIENT_ID && process.env.PHONEPE_CLIENT_SECRET) {
    const { Env, StandardCheckoutClient } = await import("@phonepe-pg/pg-sdk-node");

    const client = StandardCheckoutClient.getInstance(
      process.env.PHONEPE_CLIENT_ID,
      process.env.PHONEPE_CLIENT_SECRET,
      Number(process.env.PHONEPE_CLIENT_VERSION ?? "1"),
      process.env.PHONEPE_ENV === "production" ? Env.PRODUCTION : Env.SANDBOX,
    );

    const status = await client.getOrderStatus(merchantOrderId);

    return {
      success: status.state === "COMPLETED",
      transactionId: status.paymentDetails?.[0]?.transactionId ?? null,
    };
  }

  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX ?? "1";

  if (!merchantId || !saltKey) {
    throw new Error("PhonePe verification credentials are not configured.");
  }

  // Same salt-signing scheme as createLegacyChecksum, but status checks have
  // no request body to sign — only the API path is hashed with the salt key.
  const apiPath = `/pg/v1/status/${merchantId}/${merchantOrderId}`;
  const digest = createHash("sha256")
    .update(`${apiPath}${saltKey}`)
    .digest("hex");
  const checksum = `${digest}###${saltIndex}`;

  const response = await fetch(`${getPhonePeBaseUrl()}${apiPath}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": merchantId,
    },
  });

  const data = (await response.json()) as {
    success?: boolean;
    code?: string;
    data?: {
      transactionId?: string;
    };
  };

  return {
    success: data.success === true && data.code === "PAYMENT_SUCCESS",
    transactionId: data.data?.transactionId ?? null,
  };
}
