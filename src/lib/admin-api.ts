import { assertAdminSession } from "@/lib/admin";
import type { Session } from "next-auth";

export function adminUnauthorizedResponse(): Response {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export type AdminApiAuthResult =
  | { ok: true; session: Session }
  | { ok: false; response: Response };

/** Use at the start of `/api/admin/*` handlers for consistent 401 JSON responses. */
export async function authorizeAdminApi(): Promise<AdminApiAuthResult> {
  try {
    const session = await assertAdminSession();
    return { ok: true, session };
  } catch {
    return { ok: false, response: adminUnauthorizedResponse() };
  }
}
