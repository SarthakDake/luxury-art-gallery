import { processPhonePeWebhook } from "@/lib/phonepe-webhook";
import { captureServerError } from "@/lib/sentry";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const result = await processPhonePeWebhook(request);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("[phonepe-webhook] failed:", error);
    captureServerError(error, { route: "phonepe-webhook" });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
