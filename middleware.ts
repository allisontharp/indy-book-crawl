import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";


export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Check if user has admin role
    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      console.log("Unauthorized access attempt to admin page, redirecting to signin");
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", "/admin/dashboard");
      return NextResponse.redirect(signInUrl);
    }

    // Add authorization header to API requests
    if (req.nextUrl.pathname.startsWith("/api/") && token?.accessToken) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('Authorization', `Bearer ${token.accessToken}`);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Skip auth check for auth routes
        if (req.nextUrl.pathname.startsWith("/auth/")) {
          return true;
        }
        return !!token;
      }
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/auth/:path*"
  ]
};