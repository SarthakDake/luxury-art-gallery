import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type FormEnquiryKind = "contact" | "signature-enquiry" | "trade-enquiry";

export async function persistFormEnquiry(
  kind: FormEnquiryKind,
  payload: Record<string, unknown>,
): Promise<string> {
  const row = await prisma.formEnquiry.create({
    data: {
      kind,
      payload: payload as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  return row.id;
}

export async function markFormEnquiryEmailSent(id: string): Promise<void> {
  await prisma.formEnquiry.update({
    where: { id },
    data: { emailSent: true },
  });
}
