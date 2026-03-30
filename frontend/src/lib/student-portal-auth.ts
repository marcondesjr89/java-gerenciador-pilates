import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export function encodeStudentPortalSession(payload: StudentPortalSessionPayload) {
  const session: StudentPortalSessionUser = {
    accessToken: payload.accessToken,
    email: payload.email,
    fullName: payload.fullName,
    studentId: payload.studentId,
    expiresAt: Date.now() + payload.expiresInSeconds * 1000
  };

  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

export function decodeStudentPortalSession(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as Partial<StudentPortalSessionUser>;
    if (
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
  } catch {
    return null;
  }
}

export async function getStudentPortalSessionUser() {
  const cookieStore = await cookies();
  return decodeStudentPortalSession(cookieStore.get(STUDENT_PORTAL_SESSION_COOKIE_NAME)?.value);
}

export async function requireStudentPortalSession() {
  const session = await getStudentPortalSessionUser();

  if (!session) {
    redirect("/portal/login");
  }

  return session;
}
