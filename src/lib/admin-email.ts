import config from "@/data/config.json";

export function getAdminEmail() {
  return (
    process.env.ADMIN_EMAIL ??
    process.env.CONTACT_EMAIL ??
    config.adminEmail ??
    config.contactEmail
  )
    .trim()
    .toLowerCase();
}
