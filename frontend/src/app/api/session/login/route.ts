import { NextResponse } from "next/server";
import { badRequest, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";
import { API_BASE_URL, type AuthenticatedUserResponse, type LoginResponse } from "@/lib/api";
import { SESSION_COOKIE_NAME, encodeSession } from "@/lib/auth";

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

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
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

  const payload = (await response.json()) as LoginResponse;
  if (payload.role !== "ADMIN" && payload.role !== "RECEPTION" && payload.role !== "INSTRUCTOR") {
    return NextResponse.json({ message: "Perfil sem acesso ao frontend." }, { status: 403 });
  }

  const meResponse = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${payload.accessToken}`
    },
    cache: "no-store"
  });

  if (!meResponse.ok) {
    return NextResponse.json({ message: "Nao foi possivel carregar os dados do usuario." }, { status: 502 });
  }

  const user = (await meResponse.json()) as AuthenticatedUserResponse;

  const sessionCookie = await encodeSession({
    accessToken: payload.accessToken,
    email: payload.email,
    userId: user.id,
    fullName: user.fullName,
    expiresInSeconds: payload.expiresInSeconds,
    role: payload.role
  });

  const nextResponse = NextResponse.json({
    email: payload.email,
    fullName: user.fullName,
    userId: user.id,
    role: payload.role
  });

  nextResponse.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionCookie,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: payload.expiresInSeconds,
    secure: process.env.NODE_ENV === "production"
  });

  return nextResponse;
}
