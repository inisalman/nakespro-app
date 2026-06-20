import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(req: NextRequest) {
  const sessionCookie = getSessionCookie(req);

  // Protected routes that require authentication
  const protectedPaths = ["/admin", "/register", "/templates", "/payment", "/form", "/dashboard"];
  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/register", "/templates", "/payment/:path*", "/form/:path*", "/dashboard", "/dashboard/:path*"],
};
