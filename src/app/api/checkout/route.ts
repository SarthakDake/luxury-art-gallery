import { authOptions } from "@/lib/auth";
import { verifyCartItems } from "@/lib/catalog";
import { createPhonePePayment } from "@/lib/payments/phonepe";
import {
  getAppBaseUrl,
  resolvePaymentGateway,
} from "@/lib/payments/gateway";
import { prisma } from "@/lib/prisma";
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
}

export async function POST(request: Request) {
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

  const verifiedItems = verifyCartItems(body.items ?? []);

  if (!verifiedItems) {
    return NextResponse.json(
      { error: "Invalid or unavailable cart items." },
      { status: 400 },
    );
  }

  const totalAmount = verifiedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
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
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout order.",
      },
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
