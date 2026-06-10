import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Check if accessing admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // Check if session cookie exists (lightweight Edge-safe check)
    const sessionCookie = req.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
