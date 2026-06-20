import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export { getAdminEmail } from "@/lib/admin-email";

export function isAdminRole(role: string | undefined | null) {
  return role === "ADMIN";
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    redirect("/");
  }

  return session;
}

export async function assertAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    throw new Error("Unauthorized");
  }

  return session;
}
