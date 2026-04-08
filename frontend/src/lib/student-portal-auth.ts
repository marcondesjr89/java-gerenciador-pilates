import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeLegacySessionCookie, decodeSignedSessionCookie, encodeSignedSessionCookie } from "@/lib/session-cookie";

export const STUDENT_PORTAL_SESSION_COOKIE_NAME = "gp_student_portal_session";

export type StudentPortalSessionUser = {
  accessToken: string;
  email: string;
  fullName: string;
  studentId: string;
  expiresAt: number;
};

export type StudentPortalSessionPayload = {
  accessToken: string;
  email: string;
  fullName: string;
  studentId: string;
  expiresInSeconds: number;
};

export async function encodeStudentPortalSession(payload: StudentPortalSessionPayload) {
  const session: StudentPortalSessionUser = {
    accessToken: payload.accessToken,
    email: payload.email,
    fullName: payload.fullName,
    studentId: payload.studentId,
    expiresAt: Date.now() + payload.expiresInSeconds * 1000
  };

  return encodeSignedSessionCookie(session, "student-portal-session");
}

function parseStudentPortalSession(parsed: Partial<StudentPortalSessionUser> | null) {
  if (
    !parsed ||
    typeof parsed.accessToken !== "string" ||
    typeof parsed.email !== "string" ||
    typeof parsed.fullName !== "string" ||
    typeof parsed.studentId !== "string" ||
    typeof parsed.expiresAt !== "number"
  ) {
    return null;
  }

  if (parsed.expiresAt <= Date.now()) {
    return null;
  }

  return {
    accessToken: parsed.accessToken,
    email: parsed.email,
    fullName: parsed.fullName,
    studentId: parsed.studentId,
    expiresAt: parsed.expiresAt
  };
}

export async function decodeStudentPortalSession(value?: string) {
  const signedSession = parseStudentPortalSession(
    await decodeSignedSessionCookie<Partial<StudentPortalSessionUser>>(value, "student-portal-session")
  );

  if (signedSession) {
    return signedSession;
  }

  return parseStudentPortalSession(decodeLegacySessionCookie<Partial<StudentPortalSessionUser>>(value));
}

export async function getStudentPortalSessionUser() {
  const cookieStore = await cookies();
  return await decodeStudentPortalSession(cookieStore.get(STUDENT_PORTAL_SESSION_COOKIE_NAME)?.value);
}

export async function requireStudentPortalSession() {
  const session = await getStudentPortalSessionUser();

  if (!session) {
    redirect("/portal/login");
  }

  return session;
}
