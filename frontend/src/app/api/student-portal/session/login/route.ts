import { NextResponse } from "next/server";
import { badRequest, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";
import { API_BASE_URL } from "@/lib/api";
import { STUDENT_PORTAL_SESSION_COOKIE_NAME, encodeStudentPortalSession } from "@/lib/student-portal-auth";

type StudentPortalLoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  studentId: string;
  email: string;
  fullName: string;
};

export async function POST(request: Request) {
  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as { email?: unknown; password?: unknown };
  const email = readTrimmedString(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return badRequest("Informe e-mail e senha.");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/student-portal/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Credenciais invalidas." }, { status: 401 });
  }

  const payload = (await response.json()) as StudentPortalLoginResponse;
  const sessionCookie = await encodeStudentPortalSession({
    accessToken: payload.accessToken,
    email: payload.email,
    fullName: payload.fullName,
    studentId: payload.studentId,
    expiresInSeconds: payload.expiresInSeconds
  });

  const nextResponse = NextResponse.json({
    email: payload.email,
    fullName: payload.fullName,
    studentId: payload.studentId
  });

  nextResponse.cookies.set({
    name: STUDENT_PORTAL_SESSION_COOKIE_NAME,
    value: sessionCookie,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: payload.expiresInSeconds,
    secure: process.env.NODE_ENV === "production"
  });

  return nextResponse;
}
