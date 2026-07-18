import { authOptions } from "@/lib/auth";
import { isLocalAdminBypassEnabled } from "@/lib/local-admin-bypass";
import { getServerSession, type Session } from "next-auth";
import { redirect } from "next/navigation";

export { getAdminEmail } from "@/lib/admin-email";
export { isLocalAdminBypassEnabled } from "@/lib/local-admin-bypass";

export function isAdminRole(role: string | undefined | null) {
  return role === "ADMIN";
}

const LOCAL_DEV_ADMIN_SESSION = {
  user: {
    id: "local-dev-admin",
    name: "Local Dev",
    email: "local-dev@localhost",
    role: "ADMIN" as const,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
} satisfies Session;

export async function requireAdminSession(callbackPath = "/admin/content") {
  const session = await getServerSession(authOptions);

  if (isLocalAdminBypassEnabled()) {
    return session ?? LOCAL_DEV_ADMIN_SESSION;
  }

  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }

  return session;
}

export async function assertAdminSession() {
  const session = await getServerSession(authOptions);

  if (isLocalAdminBypassEnabled()) {
    return session ?? LOCAL_DEV_ADMIN_SESSION;
  }

  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    throw new Error("Unauthorized");
  }

  return session;
}
