import {
  DEFAULT_ADMIN_EMAILS,
  DEFAULT_CONTACT_EMAIL,
  formatEmailList,
  parseEmailList,
} from "@/lib/email-list";
import { getSiteConfig } from "@/lib/site-data";

export {
  DEFAULT_ADMIN_EMAILS,
  DEFAULT_CONTACT_EMAIL,
  formatEmailList,
  parseEmailList,
};

export async function getAdminEmails(): Promise<string[]> {
  const config = await getSiteConfig();
  const combined = [
    ...parseEmailList(process.env.ADMIN_EMAIL),
    ...parseEmailList(config.adminEmail),
  ];

  const unique = [...new Set(combined)];
  return unique.length > 0 ? unique : [...DEFAULT_ADMIN_EMAILS];
}

export async function getAdminEmail() {
  const admins = await getAdminEmails();
  return admins[0] ?? DEFAULT_ADMIN_EMAILS[0];
}

export async function isAdminEmail(email: string | null | undefined) {
  if (!email?.trim()) {
    return false;
  }

  const admins = await getAdminEmails();
  return admins.includes(email.trim().toLowerCase());
}

export async function getContactEmails(): Promise<string[]> {
  const config = await getSiteConfig();
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
