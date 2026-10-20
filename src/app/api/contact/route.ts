import { deliverFormEnquiry, FormEnquiryDeliveryError } from "@/lib/deliver-form-enquiry";
import { sendContactFormEmail } from "@/lib/mailer";
import { enforceRateLimit } from "@/lib/rate-limit";
import { saveSignatureEnquiryWallPhoto } from "@/lib/signature-enquiry-upload";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_MOBILE_LENGTH = 24;
const MAX_LOCATION_LENGTH = 200;
const MAX_SPACE_TYPE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;

const DEFAULT_SUBJECT = "Website contact enquiry";

function sanitizeField(
  value: FormDataEntryValue | null,
  maxLength: number,
  required = true,
): string | null {
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
  const rateLimitResponse = await enforceRateLimit(request, "contact");

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const name = sanitizeField(formData.get("name"), MAX_NAME_LENGTH);
  const emailRaw = sanitizeField(formData.get("email"), MAX_EMAIL_LENGTH, false) ?? "";
  const mobile = sanitizeField(formData.get("mobile"), MAX_MOBILE_LENGTH);
  const location = sanitizeField(formData.get("location"), MAX_LOCATION_LENGTH);
  const spaceType =
    sanitizeField(formData.get("spaceType"), MAX_SPACE_TYPE_LENGTH, false) ?? "";
  const message = sanitizeField(formData.get("message"), MAX_MESSAGE_LENGTH);

  if (!name || !mobile || !location || !message) {
    return NextResponse.json(
      { error: "Please complete all required fields with valid values." },
      { status: 400 },
    );
  }

  const email = emailRaw.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address or leave it blank." }, { status: 400 });
  }

  let wallPhotoUrl: string | undefined;
  let wallPhotoAttachment:
    | { filename: string; content: Buffer; contentType: string }
    | undefined;

  const wallPhotoEntry = formData.get("wallPhoto");
  if (wallPhotoEntry instanceof File && wallPhotoEntry.size > 0) {
    try {
      const saved = await saveSignatureEnquiryWallPhoto(wallPhotoEntry);
      wallPhotoUrl = saved.publicPath;
      wallPhotoAttachment = {
        filename: saved.filename,
        content: saved.buffer,
        contentType: saved.contentType,
      };
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Could not upload wall photo.";
      return NextResponse.json({ error: detail }, { status: 400 });
    }
  }

  try {
    await deliverFormEnquiry({
      kind: "contact",
      payload: {
        name,
        email: email || null,
        mobile,
        location,
        spaceType: spaceType || null,
        subject: DEFAULT_SUBJECT,
        message,
        wallPhotoUrl: wallPhotoUrl ?? null,
      },
      sendEmail: () =>
        sendContactFormEmail({
          name,
          email: email || undefined,
          mobile,
          location,
          spaceType: spaceType || undefined,
          subject: DEFAULT_SUBJECT,
          message,
          wallPhotoUrl,
          wallPhotoAttachment,
        }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof FormEnquiryDeliveryError
        ? error.message
        : "Unable to send your message right now. Please try again later.";
    console.error("Contact form submission failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
