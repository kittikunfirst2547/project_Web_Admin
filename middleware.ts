import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin-only routes
    if ((path.startsWith("/dashboard") || path.startsWith("/api/admin")) && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Authenticated users only (handled by withAuth automatically if not in public)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // NextAuth must be reachable without a session (sign-in, callbacks, session, csrf, etc.)
        if (path.startsWith("/api/auth")) {
          return true;
        }

        // Define public routes
        const publicRoutes = [
          "/",
          "/reading",
          "/shop",
          "/login",
          "/register",
          "/privacy",
          "/topics",
          "/api/health",
          "/api/reading",
          "/api/products",
        ];

        // Check if current path starts with any public route or is exactly a public route
        const isPublic = publicRoutes.some(route => 
          path === route || path.startsWith(route + "/") || (route === "/api/products" && path.startsWith("/api/products"))
        );

        if (isPublic) return true;

        // Otherwise, require a token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/api/admin/:path*",
    // We match everything to ensure public routes are handled in the callback
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
