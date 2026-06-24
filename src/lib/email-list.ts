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

export function formatEmailList(emails: string[]) {
  return emails.join(", ");
}
