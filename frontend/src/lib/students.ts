import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";

export type Student = {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  status: "ACTIVE" | "INACTIVE";
  lgpdConsent: boolean;
  createdAt: string;
};

export async function fetchStudents(session: SessionUser) {
  const students = await fetchApiJson<Student[]>(session, "/api/v1/students", {
    errorMessage: "Nao foi possivel carregar os alunos."
  });

  return students.sort((left, right) => left.fullName.localeCompare(right.fullName, "pt-BR"));
}
