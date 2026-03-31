import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, decodeSession } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/agenda", "/alunos", "/financeiro", "/notificacoes", "/instrutor"];

export function middleware(request: NextRequest) {
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const session = decodeSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const isInstructorRoute = request.nextUrl.pathname.startsWith("/instrutor");

  if (isInstructorRoute) {
    if (session.role !== "INSTRUCTOR") {
      const loginUrl = new URL("/login?error=forbidden", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (session.role !== "ADMIN" && session.role !== "RECEPTION") {
    const loginUrl = new URL("/login?error=forbidden", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/agenda/:path*", "/alunos/:path*", "/financeiro/:path*", "/notificacoes/:path*", "/instrutor/:path*"]
};
