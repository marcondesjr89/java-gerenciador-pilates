import { API_BASE_URL } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";

export type StudentPortalAccount = {
  id: string;
  studentId: string;
  email: string;
  active: boolean;
};

export async function fetchStudentPortalAccount(session: SessionUser, studentId: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/students/${studentId}/portal-account`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar a conta do portal.");
  }

  return (await response.json()) as StudentPortalAccount;
}
