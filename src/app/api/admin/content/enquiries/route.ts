import { authorizeAdminApi } from "@/lib/admin-api";
import type { AdminFormEnquiry } from "@/lib/form-enquiry-display";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_ENQUIRIES = 250;

function isMissingFormEnquiryTable(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2021"
  );
}

export async function GET() {
  const auth = await authorizeAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const rows = await prisma.formEnquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: MAX_ENQUIRIES,
    });

    const enquiries: AdminFormEnquiry[] = rows.map((row) => ({
      id: row.id,
      kind: row.kind as AdminFormEnquiry["kind"],
      emailSent: row.emailSent,
      createdAt: row.createdAt.toISOString(),
      payload:
        row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
          ? (row.payload as Record<string, unknown>)
          : {},
    }));

    return Response.json({ enquiries });
  } catch (error) {
    if (isMissingFormEnquiryTable(error)) {
      return Response.json({
        enquiries: [] as AdminFormEnquiry[],
        migrationRequired: true,
      });
    }

    console.error("[admin/enquiries] load failed:", error);
    return Response.json(
      { error: "Could not load enquiries. Try again in a moment." },
      { status: 500 },
    );
  }
}
