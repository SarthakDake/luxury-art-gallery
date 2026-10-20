import { deliverFormEnquiry, FormEnquiryDeliveryError } from "@/lib/deliver-form-enquiry";
import {
  ENQUIRY_LIMITS,
  normalizeOptionalEnquiryEmail,
  sanitizeEnquiryField,
} from "@/lib/form-enquiry-fields";
import { sendTradeEnquiryEmail } from "@/lib/mailer";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TradeEnquiryBody {
  name?: string;
  email?: string;
  mobile?: string;
  company?: string;
  projectType?: string;
  subject?: string;
  message?: string;
}

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit(request, "trade-enquiry");

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  let body: TradeEnquiryBody;

  try {
    body = (await request.json()) as TradeEnquiryBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = sanitizeEnquiryField(body.name, ENQUIRY_LIMITS.name);
  const emailRaw = sanitizeEnquiryField(body.email, ENQUIRY_LIMITS.email, false) ?? "";
  const mobile = sanitizeEnquiryField(body.mobile, ENQUIRY_LIMITS.mobile);
  const company = sanitizeEnquiryField(body.company, ENQUIRY_LIMITS.company, false) ?? "";
  const projectType =
    sanitizeEnquiryField(body.projectType, ENQUIRY_LIMITS.projectType, false) ?? "";
  const subject = sanitizeEnquiryField(body.subject, ENQUIRY_LIMITS.subject);
  const message = sanitizeEnquiryField(body.message, ENQUIRY_LIMITS.message);

  if (!name || !mobile || !subject || !message) {
    return NextResponse.json(
      { error: "Please complete all required fields with valid values." },
      { status: 400 },
    );
  }

  const emailResult = normalizeOptionalEnquiryEmail(emailRaw);
  if (!emailResult.ok) {
    return NextResponse.json({ error: emailResult.message }, { status: 400 });
  }
  const email = emailResult.email;

  try {
    await deliverFormEnquiry({
      kind: "trade-enquiry",
      payload: {
        name,
        email: email || null,
        mobile,
        company: company || null,
        projectType: projectType || null,
        subject,
        message,
      },
      sendEmail: () =>
        sendTradeEnquiryEmail({
          name,
          email: email || undefined,
          mobile,
          company: company || undefined,
          projectType: projectType || undefined,
          subject,
          message,
        }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof FormEnquiryDeliveryError
        ? error.message
        : "Unable to send your enquiry right now. Please try again later.";
    console.error("Trade enquiry submission failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
