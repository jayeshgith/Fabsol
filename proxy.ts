import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow Auth.js API routes (VERY IMPORTANT)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = await auth();

  // 🔒 Protect dashboard
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
