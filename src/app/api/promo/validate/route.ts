import { applyPromoCode } from "@/lib/promo-codes";
import { getSiteConfig } from "@/lib/site-data";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PromoValidateBody {
  code?: string;
  subtotal?: number;
}

export async function POST(request: Request) {
  let body: PromoValidateBody;

  try {
    body = (await request.json()) as PromoValidateBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const subtotal = body.subtotal;

  if (typeof subtotal !== "number" || !Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ error: "Invalid subtotal." }, { status: 400 });
  }

  const siteConfig = await getSiteConfig();
  const result = applyPromoCode(body.code ?? "", subtotal, siteConfig);

  if (!result.valid) {
    return NextResponse.json({ valid: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    code: result.code,
    headline: result.headline,
    discount: result.discount,
    subtotal: result.subtotal,
    finalTotal: result.finalTotal,
  });
}
