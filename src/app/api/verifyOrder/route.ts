import { authOptions } from "@/lib/auth";
import { sendNewOrderConfirmedEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface VerifyOrderBody {
  orderId?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
) {
  const expectedSignature = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeySecret) {
    return NextResponse.json(
      { error: "Payment verification is not configured." },
      { status: 500 },
    );
  }

  let body: VerifyOrderBody;

  try {
    body = (await request.json()) as VerifyOrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    orderId,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = body;

  if (
    !orderId ||
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !razorpaySignature
  ) {
    return NextResponse.json(
      { error: "Missing payment verification fields." },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (order.status === "PAID") {
    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: order.status,
    });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Order cannot be verified in its current state." },
      { status: 409 },
    );
  }

  if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
    return NextResponse.json(
      { error: "Payment order mismatch." },
      { status: 400 },
    );
  }

  const isValidSignature = verifyRazorpaySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    razorpayKeySecret,
  );

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
  }

  const updateResult = await prisma.order.updateMany({
    where: {
      id: order.id,
      userId: session.user.id,
      status: "PENDING",
      razorpayOrderId: razorpayOrderId,
    },
    data: {
      status: "PAID",
      razorpayPaymentId,
      razorpayOrderId,
    },
  });

  if (updateResult.count === 0) {
    const latestOrder = await prisma.order.findUnique({
      where: { id: order.id },
      select: { status: true },
    });

    if (latestOrder?.status === "PAID") {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: latestOrder.status,
      });
    }

    return NextResponse.json(
      { error: "Order could not be updated." },
      { status: 409 },
    );
  }

  const updatedOrder = await prisma.order.findUniqueOrThrow({
    where: { id: order.id },
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

  try {
    await sendNewOrderConfirmedEmail({
      orderId: updatedOrder.id,
      buyerEmail: updatedOrder.user.email,
      buyerName: updatedOrder.user.name,
      totalAmount: Number(updatedOrder.totalAmount),
      createdAt: updatedOrder.createdAt,
      items: updatedOrder.items.map((item) => ({
        artworkId: item.artworkId,
        size: item.size,
        price: Number(item.price),
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error("Failed to send new order email:", error);
  }

  return NextResponse.json({
    success: true,
    orderId: updatedOrder.id,
    status: updatedOrder.status,
  });
}
