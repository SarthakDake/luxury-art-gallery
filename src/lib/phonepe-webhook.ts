// Handles inbound PhonePe webhook calls that notify us of payment outcomes.
// SECURITY CRITICAL: anyone can POST to this endpoint, so the X-VERIFY
// checksum below is the only thing standing between a legitimate PhonePe
// notification and a forged request that would mark an unpaid order as PAID.
// Never trust the payload's reported success/code without verifying it first.
import { createHash, timingSafeEqual } from "node:crypto";
import { sendNewOrderConfirmedEmail } from "@/lib/mailer";
import { verifyPhonePePayment } from "@/lib/payments/phonepe";
import { prisma } from "@/lib/prisma";

interface PhonePeWebhookPayload {
  success?: boolean;
  code?: string;
  data?: {
    merchantTransactionId?: string;
    transactionId?: string;
  };
}

// Recomputes the expected checksum from the raw request body + our salt key
// and compares it to the X-VERIFY header PhonePe sent. Only PhonePe (which
// knows the salt key) can produce a matching checksum for a given body, so
// this proves the webhook wasn't forged or tampered with in transit.
// timingSafeEqual avoids leaking checksum bytes via response-time side
// channels; the salt index (identifying which rotated salt was used) must
// also match what we've configured.
export function verifyPhonePeWebhookChecksum(
  responseBody: string,
  xVerify: string | null,
): boolean {
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX ?? "1";

  if (!saltKey || !xVerify) {
    return false;
  }

  const [checksum, index] = xVerify.split("###");

  if (!checksum || index !== saltIndex) {
    return false;
  }

  const expected = createHash("sha256")
    .update(`${responseBody}${saltKey}`)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(checksum), Buffer.from(expected));
  } catch {
    return false;
  }
}

// PhonePe wraps the actual event data as a base64 string under `response`
// (legacy format); newer payloads may send plain JSON directly. Support both.
function decodeWebhookPayload(rawBody: string): PhonePeWebhookPayload | null {
  try {
    const json = JSON.parse(rawBody) as { response?: string };

    if (typeof json.response === "string") {
      const decoded = Buffer.from(json.response, "base64").toString("utf8");
      return JSON.parse(decoded) as PhonePeWebhookPayload;
    }

    return json as PhonePeWebhookPayload;
  } catch {
    return null;
  }
}

// Idempotency guard: webhooks can be retried/duplicated by PhonePe, and this
// can also be reached via the status-check fallback in processPhonePeWebhook.
// The conditional updateMany (status: "PENDING") ensures only the first
// caller to win the race actually flips the order and sends the email.
async function markOrderPaid(orderId: string, transactionId: string | null) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!order || order.status === "PAID") {
    return;
  }

  const updateResult = await prisma.order.updateMany({
    where: {
      id: order.id,
      status: "PENDING",
      paymentProvider: "PHONEPE",
    },
    data: {
      status: "PAID",
      phonePeTransactionId: transactionId,
    },
  });

  if (updateResult.count !== 1) {
    return;
  }

  try {
    await sendNewOrderConfirmedEmail({
      orderId: order.id,
      buyerEmail: order.user.email,
      buyerName: order.user.name,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        artworkId: item.artworkId,
        size: item.size,
        price: Number(item.price),
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error("[phonepe-webhook] order email failed:", error);
  }
}

export async function processPhonePeWebhook(request: Request) {
  const rawBody = await request.text();
  const xVerify = request.headers.get("X-VERIFY");

  // Fail closed: if we can't verify signatures at all, refuse rather than
  // silently accepting unverified payment claims.
  if (!process.env.PHONEPE_SALT_KEY) {
    return {
      status: 401 as const,
      body: { error: "Webhook verification is not configured." },
    };
  }

  // Reject anything that doesn't carry a valid PhonePe-signed checksum
  // before touching the payload or the database at all.
  if (!verifyPhonePeWebhookChecksum(rawBody, xVerify)) {
    return { status: 401 as const, body: { error: "Invalid webhook signature." } };
  }

  const payload = decodeWebhookPayload(rawBody);

  if (!payload) {
    return { status: 400 as const, body: { error: "Invalid webhook payload." } };
  }

  const merchantOrderId = payload.data?.merchantTransactionId;

  if (!merchantOrderId) {
    return { status: 200 as const, body: { received: true, ignored: true } };
  }

  const order = await prisma.order.findFirst({
    where: { phonePeMerchantOrderId: merchantOrderId },
    select: { id: true, status: true },
  });

  if (!order) {
    return { status: 200 as const, body: { received: true, ignored: true } };
  }

  if (order.status === "PAID") {
    return { status: 200 as const, body: { received: true, alreadyPaid: true } };
  }

  const paymentSuccess =
    payload.success === true &&
    (payload.code === "PAYMENT_SUCCESS" || payload.code === "COMPLETED");

  if (paymentSuccess) {
    await markOrderPaid(order.id, payload.data?.transactionId ?? null);
    return { status: 200 as const, body: { received: true, paid: true } };
  }

  // The webhook's own payload didn't report success, but rather than trust
  // that as final, double-check directly against PhonePe's status API —
  // guards against payloads that don't carry a definitive outcome.
  try {
    const verification = await verifyPhonePePayment(merchantOrderId);

    if (verification.success) {
      await markOrderPaid(order.id, verification.transactionId);
      return { status: 200 as const, body: { received: true, paid: true } };
    }
  } catch (error) {
    console.error("[phonepe-webhook] status verification failed:", error);
  }

  return { status: 200 as const, body: { received: true } };
}
