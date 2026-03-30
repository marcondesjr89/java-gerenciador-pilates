import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE_NAME = "gp_internal_session";

export type InternalUserRole = "ADMIN" | "RECEPTION" | "INSTRUCTOR";

export type SessionUser = {
  accessToken: string;
  email: string;
  userId: string;
  fullName: string;
  expiresAt: number;
  role: InternalUserRole;
};

export type SessionPayload = {
  accessToken: string;
  email: string;
  userId: string;
  fullName: string;
  expiresInSeconds: number;
  role: InternalUserRole;
};

function isInternalUserRole(value: unknown): value is InternalUserRole {
  return value === "ADMIN" || value === "RECEPTION" || value === "INSTRUCTOR";
}

export function encodeSession(payload: SessionPayload) {
  const session: SessionUser = {
    accessToken: payload.accessToken,
    email: payload.email,
    userId: payload.userId,
    fullName: payload.fullName,
    expiresAt: Date.now() + payload.expiresInSeconds * 1000,
    role: payload.role
  };

  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

export function decodeSession(value?: string): SessionUser | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as Partial<SessionUser>;
    if (
      typeof parsed.accessToken !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.userId !== "string" ||
      typeof parsed.fullName !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      !isInternalUserRole(parsed.role)
    ) {
      return null;
    }

    if (parsed.expiresAt <= Date.now()) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      email: parsed.email,
      userId: parsed.userId,
      fullName: parsed.fullName,
      expiresAt: parsed.expiresAt,
      role: parsed.role
    };
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function requireInternalSession() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN" && session.role !== "RECEPTION") {
    redirect("/login?error=forbidden");
  }

  return session;
}

export async function requireInstructorSession() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "INSTRUCTOR") {
    redirect("/login?error=forbidden");
  }

  return session;
}
