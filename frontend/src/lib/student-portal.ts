import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";

export type StudentPortalAccount = {
  id: string;
  studentId: string;
  email: string;
  active: boolean;
};

export async function fetchStudentPortalAccount(session: SessionUser, studentId: string) {
  return fetchApiJson<StudentPortalAccount | null>(session, `/api/v1/students/${studentId}/portal-account`, {
    errorMessage: "Nao foi possivel carregar a conta do portal.",
    nullStatuses: [404]
  });
}
