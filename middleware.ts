/**
 * Route protection middleware: requires sign-in on /profile, requires the
 * ADMIN role on /admin and /api/admin (unless the local dev bypass applies),
 * and leaves other /api routes open to unauthenticated requests.
 */
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
      // Returning true here means "allow" — withAuth only redirects to the
      // sign-in page when this returns false, so every branch below is an
      // explicit access decision, not just a redirect trigger.
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const isAdminSurface =
          pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

        if (isAdminSurface) {
          // Dev-only escape hatch; hard-disabled on Vercel regardless of role.
          // See src/lib/local-admin-bypass.ts for the guarding logic.
          if (isLocalAdminBypassEnabled()) {
            return true;
          }
          return token?.role === "ADMIN";
        }

        // Non-admin /api routes must stay open even for unauthenticated
        // requests — many are called by unauthenticated storefront pages
        // (e.g. product listings). Auth-required API routes enforce their
        // own checks internally.
        if (pathname.startsWith("/api/")) {
          return true;
        }

        return Boolean(token);
      },
    },
  },
);

// /api/:path* is included so the `authorized` callback above can run its
// admin check on /api/admin/**; it deliberately allows all other API routes
// through rather than blocking them at the matcher level.
export const config = {
  matcher: [
    "/profile",
    "/profile/:path*",
    "/admin",
    "/admin/:path*",
    "/api/:path*",
  ],
};
