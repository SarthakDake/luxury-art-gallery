import { saveSignatureEnquiryWallPhoto } from "@/lib/signature-enquiry-upload";

export const ENQUIRY_LIMITS = {
  name: 120,
  email: 254,
  mobile: 24,
  location: 200,
  spaceType: 120,
  company: 160,
  projectType: 120,
  subject: 160,
  message: 4000,
  projectTitle: 160,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeEnquiryField(
  value: FormDataEntryValue | unknown,
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

export function normalizeOptionalEnquiryEmail(
  emailRaw: string,
): { ok: true; email: string } | { ok: false; message: string } {
  const email = emailRaw.trim();

  if (!email) {
    return { ok: true, email: "" };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return {
      ok: false,
      message: "Enter a valid email address or leave it blank.",
    };
  }

  return { ok: true, email };
}

export type WallPhotoAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

export async function readWallPhotoFromForm(
  formData: FormData,
): Promise<
  | {
      ok: true;
      wallPhotoUrl?: string;
      wallPhotoAttachment?: WallPhotoAttachment;
    }
  | { ok: false; error: string }
> {
  const wallPhotoEntry = formData.get("wallPhoto");

  if (!(wallPhotoEntry instanceof File) || wallPhotoEntry.size === 0) {
    return { ok: true };
  }

  try {
    const saved = await saveSignatureEnquiryWallPhoto(wallPhotoEntry);
    return {
      ok: true,
      wallPhotoUrl: saved.publicPath,
      wallPhotoAttachment: {
        filename: saved.filename,
        content: saved.buffer,
        contentType: saved.contentType,
      },
    };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Could not upload wall photo.";
    return { ok: false, error: detail };
  }
}
