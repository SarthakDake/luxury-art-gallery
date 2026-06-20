import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    console.info("PhonePe webhook received:", payload.slice(0, 500));
  } catch (error) {
    console.error("PhonePe webhook parse failed:", error);
  }

  return NextResponse.json({ received: true });
}
