"use server";

import { assertAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function isValidOrderId(orderId: string) {
  return typeof orderId === "string" && orderId.length >= 10 && orderId.length <= 64;
}

export async function markOrderShipped(orderId: string) {
  await assertAdminSession();

  if (!isValidOrderId(orderId)) {
    return { error: "Invalid order ID." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true },
  });

  if (!order) {
    return { error: "Order not found." };
  }

  if (order.status !== "PAID") {
    return { error: "Only paid orders can be marked as shipped." };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "SHIPPED" },
  });

  revalidatePath("/admin/orders");

  return { success: true };
}
