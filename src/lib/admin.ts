import config from "@/data/config.json";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export function getAdminEmail() {
  return (config.adminEmail ?? config.contactEmail).trim().toLowerCase();
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email?.trim().toLowerCase();

  if (!userEmail || userEmail !== getAdminEmail()) {
    redirect("/");
  }

  return session;
}

export async function assertAdminSession() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email?.trim().toLowerCase();

  if (!userEmail || userEmail !== getAdminEmail()) {
    throw new Error("Unauthorized");
  }

  return session;
}
