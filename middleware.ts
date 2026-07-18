import { isLocalAdminBypassEnabled } from "@/lib/local-admin-bypass";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function redirectBrowserApiVisitToHome(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // PDF iframe navigations often send Accept: text/html — never redirect those.
  if (pathname.startsWith("/api/site-document/")) {
    return null;
  }

  if (
    request.method === "GET" &&
    pathname.startsWith("/api/") &&
    (request.headers.get("accept") ?? "").includes("text/html")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return null;
}

export default withAuth(
  function middleware(request) {
    return redirectBrowserApiVisitToHome(request);
  },
  {
    pages: {
      signIn: "/signin",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const isAdminSurface =
          pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

        if (isAdminSurface) {
          if (isLocalAdminBypassEnabled()) {
            return true;
          }
          return token?.role === "ADMIN";
        }

        if (pathname.startsWith("/api/")) {
          return true;
        }

        return Boolean(token);
      },
    },
  },
);

export const config = {
  matcher: [
    "/profile",
    "/profile/:path*",
    "/admin",
    "/admin/:path*",
    "/api/:path*",
  ],
};
