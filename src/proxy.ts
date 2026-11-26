import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Optimistic check only: no cookie → sign-in page.
 * The pages check the session in the database (lib/auth/session.ts).
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/rapport/:path*", "/equipe", "/presentation", "/admin/:path*"],
};
