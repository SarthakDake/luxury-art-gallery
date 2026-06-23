import config from "@/data/config.json";

export const DEFAULT_ADMIN_EMAILS = [
  "sarthaksdake@gmail.com",
  "colorsnjoybyaish@gmail.com",
] as const;

export const DEFAULT_CONTACT_EMAIL = "colorsnjoybyaish@gmail.com";

export function parseEmailList(value: string | undefined | null): string[] {
  if (!value?.trim()) {
    return [];
  }

  return [
    ...new Set(
      value
        .split(/[,;]+/)
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export function getAdminEmails(): string[] {
  const combined = [
    ...parseEmailList(process.env.ADMIN_EMAIL),
    ...parseEmailList(config.adminEmail),
  ];

  const unique = [...new Set(combined)];
  return unique.length > 0 ? unique : [...DEFAULT_ADMIN_EMAILS];
}

export function getAdminEmail() {
  return getAdminEmails()[0] ?? DEFAULT_ADMIN_EMAILS[0];
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email?.trim()) {
    return false;
  }

  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function getContactEmails(): string[] {
  const combined = [
    ...parseEmailList(process.env.CONTACT_EMAIL),
    ...parseEmailList(config.contactEmail),
  ];

  const unique = [...new Set(combined)];
  if (unique.length > 0) {
    return unique;
  }

  return [DEFAULT_CONTACT_EMAIL];
}

export function formatEmailList(emails: string[]) {
  return emails.join(", ");
}
