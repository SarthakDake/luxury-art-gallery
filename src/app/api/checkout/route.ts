import { authOptions } from "@/lib/auth";
import { verifyCartItems } from "@/lib/catalog";
import { applyPromoCode } from "@/lib/promo-codes";
import { getSiteConfig } from "@/lib/site-data";
import { createPhonePePayment } from "@/lib/payments/phonepe";
import {
  getAppBaseUrl,
  resolvePaymentGateway,
} from "@/lib/payments/gateway";
import { prisma } from "@/lib/prisma";
import { captureServerError } from "@/lib/sentry";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRazorpayClient } from "@/lib/razorpay";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface CheckoutItemInput {
  id: string;
  selectedSize: string;
  price: number;
  quantity: number;
}

interface CheckoutBody {
  items?: CheckoutItemInput[];
  promoCode?: string;
}

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit(request, "checkout");

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const gateway = resolvePaymentGateway();

  if (!gateway) {
    return NextResponse.json(
      { error: "No payment gateway is configured." },
      { status: 500 },
    );
  }

  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const verifiedItems = await verifyCartItems(body.items ?? []);

  if (!verifiedItems) {
    return NextResponse.json(
      { error: "Invalid or unavailable cart items." },
      { status: 400 },
    );
  }

  const subtotal = verifiedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  let discountAmount = 0;
  let promoCode: string | undefined;

  if (body.promoCode?.trim()) {
    const siteConfig = await getSiteConfig();
    const promoResult = applyPromoCode(body.promoCode, subtotal, siteConfig);

    if (!promoResult.valid) {
      return NextResponse.json({ error: promoResult.message }, { status: 400 });
    }

    discountAmount = promoResult.discount;
    promoCode = promoResult.code;
  }

  const totalAmount = subtotal - discountAmount;
  const amountInPaise = Math.round(totalAmount * 100);

  if (amountInPaise < 100) {
    return NextResponse.json(
      { error: "Order total must be at least ₹1." },
      { status: 400 },
    );
  }

  try {
    if (gateway === "razorpay") {
      const razorpay = getRazorpayClient();
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `cnj_${Date.now()}`,
      });

      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          discountAmount,
          promoCode,
          status: "PENDING",
          paymentProvider: "RAZORPAY",
          razorpayOrderId: razorpayOrder.id,
          items: {
            create: verifiedItems.map((item) => ({
              artworkId: item.artworkId,
              size: item.size,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      return NextResponse.json({
        provider: "razorpay",
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        discountAmount,
        promoCode,
        status: "PENDING",
        paymentProvider: "PHONEPE",
        items: {
          create: verifiedItems.map((item) => ({
            artworkId: item.artworkId,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    const phonePePayment = await createPhonePePayment({
      orderId: order.id,
      amountInPaise,
      userId: session.user.id,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        phonePeMerchantOrderId: phonePePayment.merchantOrderId,
      },
    });

    return NextResponse.json({
      provider: "phonepe",
      orderId: order.id,
      redirectUrl: phonePePayment.redirectUrl,
      amount: amountInPaise,
      currency: "INR",
    });
  } catch (error) {
    console.error("Checkout failed:", error);
    captureServerError(error, { route: "checkout" });
    return NextResponse.json(
      { error: "Unable to create checkout order." },
      { status: 500 },
    );
  }
}

export async function GET() {
  const gateway = resolvePaymentGateway();

  return NextResponse.json({
    gateway,
    baseUrl: getAppBaseUrl(),
    razorpay: gateway === "razorpay",
    phonepe: gateway === "phonepe",
  });
}
