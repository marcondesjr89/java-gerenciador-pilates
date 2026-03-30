import { NextResponse } from "next/server";
import { STUDENT_PORTAL_SESSION_COOKIE_NAME } from "@/lib/student-portal-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: STUDENT_PORTAL_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production"
  });
  return response;
}
