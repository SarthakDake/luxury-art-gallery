import type { FormEnquiryKind } from "@/lib/form-enquiry-store";

export interface AdminFormEnquiry {
  id: string;
  kind: FormEnquiryKind;
  emailSent: boolean;
  createdAt: string;
  payload: Record<string, unknown>;
}

export const FORM_ENQUIRY_KIND_LABELS: Record<FormEnquiryKind, string> = {
  contact: "Contact us",
  "signature-enquiry": "Signature Wall Art",
  "trade-enquiry": "For Interior Designers",
};

export type FormEnquiryFilter = "all" | FormEnquiryKind;

const PAYLOAD_FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  mobile: "Mobile",
  location: "Location",
  spaceType: "Space / project type",
  company: "Company / Studio",
  projectType: "Space / project type",
  subject: "Subject",
  message: "Message",
  projectTitle: "Project",
  wallPhotoUrl: "Wall photo",
};

const PAYLOAD_FIELD_ORDER = [
  "name",
  "email",
  "mobile",
  "location",
  "company",
  "spaceType",
  "projectType",
  "projectTitle",
  "subject",
  "message",
  "wallPhotoUrl",
] as const;

function asDisplayString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
}

export function formatFormEnquiryWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function listFormEnquiryFields(
  payload: Record<string, unknown>,
): Array<{ key: string; label: string; value: string; isUrl?: boolean }> {
  const seen = new Set<string>();
  const rows: Array<{ key: string; label: string; value: string; isUrl?: boolean }> =
    [];

  for (const key of PAYLOAD_FIELD_ORDER) {
    const value = asDisplayString(payload[key]);
    if (!value) {
      continue;
    }

    seen.add(key);
    rows.push({
      key,
      label: PAYLOAD_FIELD_LABELS[key] ?? key,
      value,
      isUrl: key === "wallPhotoUrl",
    });
  }

  for (const [key, raw] of Object.entries(payload)) {
    if (seen.has(key)) {
      continue;
    }

    const value = asDisplayString(raw);
    if (!value) {
      continue;
    }

    rows.push({
      key,
      label: PAYLOAD_FIELD_LABELS[key] ?? key,
      value,
    });
  }

  return rows;
}

export function enquirySummaryLine(payload: Record<string, unknown>): string {
  const name = asDisplayString(payload.name);
  const mobile = asDisplayString(payload.mobile);
  const subject = asDisplayString(payload.subject);

  if (name && mobile) {
    return `${name} · ${mobile}`;
  }

  return name ?? mobile ?? subject ?? "Visitor enquiry";
}
