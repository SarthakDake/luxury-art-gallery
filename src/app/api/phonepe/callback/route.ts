import { sendNewOrderConfirmedEmail } from "@/lib/mailer";
import { verifyPhonePePayment } from "@/lib/payments/phonepe";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const baseRedirect = new URL("/cart", request.url);

  if (!orderId) {
    baseRedirect.searchParams.set("payment", "failed");
    baseRedirect.searchParams.set("reason", "missing-order");
    return NextResponse.redirect(baseRedirect);
  }

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

  if (!order || order.paymentProvider !== "PHONEPE" || !order.phonePeMerchantOrderId) {
    baseRedirect.searchParams.set("payment", "failed");
    baseRedirect.searchParams.set("reason", "invalid-order");
    return NextResponse.redirect(baseRedirect);
  }

  if (order.status === "PAID") {
    baseRedirect.searchParams.set("payment", "success");
    baseRedirect.searchParams.set("orderId", order.id);
    return NextResponse.redirect(baseRedirect);
  }

  try {
    const verification = await verifyPhonePePayment(order.phonePeMerchantOrderId);

    if (!verification.success) {
      baseRedirect.searchParams.set("payment", "failed");
      baseRedirect.searchParams.set("orderId", order.id);
      return NextResponse.redirect(baseRedirect);
    }

    const updateResult = await prisma.order.updateMany({
      where: {
        id: order.id,
        status: "PENDING",
        paymentProvider: "PHONEPE",
        phonePeMerchantOrderId: order.phonePeMerchantOrderId,
      },
      data: {
        status: "PAID",
        phonePeTransactionId: verification.transactionId,
      },
    });

    if (updateResult.count === 1) {
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
        console.error("Failed to send PhonePe order email:", error);
      }
    }

    baseRedirect.searchParams.set("payment", "success");
    baseRedirect.searchParams.set("orderId", order.id);
    return NextResponse.redirect(baseRedirect);
  } catch (error) {
    console.error("PhonePe callback verification failed:", error);
    baseRedirect.searchParams.set("payment", "failed");
    baseRedirect.searchParams.set("orderId", order.id);
    return NextResponse.redirect(baseRedirect);
  }
}
