import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";

export type StudentStatus = "ACTIVE" | "INACTIVE";

export type Student = {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  status: StudentStatus;
  lgpdConsent: boolean;
  createdAt: string;
};

export type StudentSummary = Pick<Student, "id" | "fullName" | "status">;

export async function fetchStudents(session: SessionUser) {
  const students = await fetchApiJson<Student[]>(session, "/api/v1/students", {
    errorMessage: "Nao foi possivel carregar os alunos."
  });

  return students.sort((left, right) => left.fullName.localeCompare(right.fullName, "pt-BR"));
}
