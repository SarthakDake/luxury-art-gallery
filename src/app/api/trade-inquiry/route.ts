import { sendTradeInquiryEmail } from "@/lib/mailer";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TradeInquiryBody {
  name?: string;
  email?: string;
  company?: string;
  projectType?: string;
  subject?: string;
  message?: string;
}

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_COMPANY_LENGTH = 160;
const MAX_PROJECT_TYPE_LENGTH = 120;
const MAX_SUBJECT_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 4000;

function sanitizeField(value: unknown, maxLength: number, required = true): string | null {
  if (typeof value !== "string") {
    return required ? null : "";
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    return null;
  }

  if (trimmed.length > maxLength) {
    return null;
  }

  return trimmed;
}

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit(request, "trade-inquiry");

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  let body: TradeInquiryBody;

  try {
    body = (await request.json()) as TradeInquiryBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = sanitizeField(body.name, MAX_NAME_LENGTH);
  const email = sanitizeField(body.email, MAX_EMAIL_LENGTH);
  const company = sanitizeField(body.company, MAX_COMPANY_LENGTH, false) ?? "";
  const projectType =
    sanitizeField(body.projectType, MAX_PROJECT_TYPE_LENGTH, false) ?? "";
  const subject = sanitizeField(body.subject, MAX_SUBJECT_LENGTH);
  const message = sanitizeField(body.message, MAX_MESSAGE_LENGTH);

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Please complete all required fields with valid values." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await sendTradeInquiryEmail({
      name,
      email,
      company: company || undefined,
      projectType: projectType || undefined,
      subject,
      message,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Trade inquiry submission failed:", error);
    return NextResponse.json(
      { error: "Unable to send your inquiry right now. Please try again later." },
      { status: 500 },
    );
  }
}
