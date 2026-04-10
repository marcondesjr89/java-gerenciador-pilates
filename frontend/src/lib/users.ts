import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";

export type InstructorUser = {
  id: string;
  fullName: string;
  specialties: string[];
};

export type StudentUser = {
  id: string;
  fullName: string;
  status: string;
};

export async function fetchInstructors(session: SessionUser) {
  return fetchApiJson<InstructorUser[]>(session, "/api/v1/users/instructors", {
    errorMessage: "Nao foi possivel carregar os instrutores."
  });
}

export async function fetchActiveStudents(session: SessionUser) {
  const students = await fetchApiJson<StudentUser[]>(session, "/api/v1/students", {
    errorMessage: "Nao foi possivel carregar os alunos."
  });

  return students
    .filter((student) => student.status === "ACTIVE")
    .sort((left, right) => left.fullName.localeCompare(right.fullName, "pt-BR"));
}
