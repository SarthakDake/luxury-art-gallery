import { deliverFormEnquiry, FormEnquiryDeliveryError } from "@/lib/deliver-form-enquiry";
import {
  ENQUIRY_LIMITS,
  normalizeOptionalEnquiryEmail,
  readWallPhotoFromForm,
  sanitizeEnquiryField,
} from "@/lib/form-enquiry-fields";
import { sendSignatureEnquiryEmail } from "@/lib/mailer";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit(request, "signature-enquiry");

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const name = sanitizeEnquiryField(formData.get("name"), ENQUIRY_LIMITS.name);
  const emailRaw =
    sanitizeEnquiryField(formData.get("email"), ENQUIRY_LIMITS.email, false) ?? "";
  const mobile = sanitizeEnquiryField(formData.get("mobile"), ENQUIRY_LIMITS.mobile);
  const location = sanitizeEnquiryField(formData.get("location"), ENQUIRY_LIMITS.location);
  const spaceType =
    sanitizeEnquiryField(formData.get("spaceType"), ENQUIRY_LIMITS.spaceType, false) ?? "";
  const subject = sanitizeEnquiryField(formData.get("subject"), ENQUIRY_LIMITS.subject);
  const message = sanitizeEnquiryField(formData.get("message"), ENQUIRY_LIMITS.message);
  const projectTitle =
    sanitizeEnquiryField(formData.get("projectTitle"), ENQUIRY_LIMITS.projectTitle, false) ??
    "";

  if (!name || !mobile || !location || !subject || !message) {
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

  const wallPhoto = await readWallPhotoFromForm(formData);
  if (!wallPhoto.ok) {
    return NextResponse.json({ error: wallPhoto.error }, { status: 400 });
  }

  try {
    await deliverFormEnquiry({
      kind: "signature-enquiry",
      payload: {
        name,
        email: email || null,
        mobile,
        location,
        spaceType: spaceType || null,
        subject,
        message,
        projectTitle: projectTitle || null,
        wallPhotoUrl: wallPhoto.wallPhotoUrl ?? null,
      },
      sendEmail: () =>
        sendSignatureEnquiryEmail({
          name,
          email: email || undefined,
          mobile,
          location,
          spaceType: spaceType || undefined,
          subject,
          message,
          projectTitle: projectTitle || undefined,
          wallPhotoUrl: wallPhoto.wallPhotoUrl,
          wallPhotoAttachment: wallPhoto.wallPhotoAttachment,
        }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof FormEnquiryDeliveryError
        ? error.message
        : "Unable to send your message right now. Please try again later.";
    console.error("Signature enquiry submission failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
