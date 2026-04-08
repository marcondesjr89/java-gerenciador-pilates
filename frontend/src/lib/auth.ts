import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeLegacySessionCookie, decodeSignedSessionCookie, encodeSignedSessionCookie } from "@/lib/session-cookie";

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

export async function encodeSession(payload: SessionPayload) {
  const session: SessionUser = {
    accessToken: payload.accessToken,
    email: payload.email,
    userId: payload.userId,
    fullName: payload.fullName,
    expiresAt: Date.now() + payload.expiresInSeconds * 1000,
    role: payload.role
  };

  return encodeSignedSessionCookie(session, "internal-session");
}

function parseSessionUser(parsed: Partial<SessionUser> | null): SessionUser | null {
  if (
    !parsed ||
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
}

export async function decodeSession(value?: string): Promise<SessionUser | null> {
  const signedSession = parseSessionUser(await decodeSignedSessionCookie<Partial<SessionUser>>(value, "internal-session"));

  if (signedSession) {
    return signedSession;
  }

  return parseSessionUser(decodeLegacySessionCookie<Partial<SessionUser>>(value));
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  return await decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
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
