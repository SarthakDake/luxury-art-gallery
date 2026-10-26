import { deliverFormEnquiry, FormEnquiryDeliveryError } from "@/lib/deliver-form-enquiry";
import {
  ENQUIRY_LIMITS,
  normalizeOptionalEnquiryEmail,
  sanitizeEnquiryField,
} from "@/lib/form-enquiry-fields";
import { sendPortfolioDownloadEnquiryEmail } from "@/lib/mailer";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface PortfolioDownloadBody {
  name?: string;
  email?: string;
  mobile?: string;
  location?: string;
}

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit(request, "portfolio-download");

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  let body: PortfolioDownloadBody;

  try {
    body = (await request.json()) as PortfolioDownloadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = sanitizeEnquiryField(body.name, ENQUIRY_LIMITS.name);
  const mobile = sanitizeEnquiryField(body.mobile, ENQUIRY_LIMITS.mobile);
  const location = sanitizeEnquiryField(body.location, ENQUIRY_LIMITS.location);
  const emailRaw = sanitizeEnquiryField(body.email, ENQUIRY_LIMITS.email);

  if (!name || !mobile || !location || !emailRaw) {
    return NextResponse.json(
      { error: "Please complete all fields with valid values." },
      { status: 400 },
    );
  }

  const emailResult = normalizeOptionalEnquiryEmail(emailRaw);
  if (!emailResult.ok) {
    return NextResponse.json({ error: emailResult.message }, { status: 400 });
  }
  if (!emailResult.email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const email = emailResult.email;

  try {
    await deliverFormEnquiry({
      kind: "portfolio-download",
      payload: {
        name,
        email,
        mobile,
        location,
      },
      sendEmail: () =>
        sendPortfolioDownloadEnquiryEmail({
          name,
          email,
          mobile,
          location,
        }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof FormEnquiryDeliveryError
        ? error.message
        : "Unable to unlock the portfolio right now. Please try again later.";
    console.error("Portfolio download gate submission failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
