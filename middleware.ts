import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isAdminApiRoute = req.nextUrl.pathname.startsWith("/api/admin");

  // Allow auth pages and auth API routes
  if (isAuthPage || isApiAuthRoute) {
    return NextResponse.next();
  }

  // Protect admin API routes
  if (isAdminApiRoute && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

