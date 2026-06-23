import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function redirectBrowserApiVisitToHome(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

        if (pathname.startsWith("/api/")) {
          return true;
        }

        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN";
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
