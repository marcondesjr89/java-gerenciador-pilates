import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";

export type StudentStatus = "ACTIVE" | "INACTIVE" | "ANONYMIZED";

export type Student = {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  phoneNumber: string;
  birthDate: string | null;
  status: StudentStatus;
  lgpdConsent: boolean;
  createdAt: string;
  anonymizedAt?: string | null;
  anonymizedReason?: string | null;
};

export type StudentSummary = Pick<Student, "id" | "fullName" | "status">;

export type StudentSearchResult = {
  items: Student[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  summary: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    lgpdStudents: number;
  };
};

export async function fetchStudents(session: SessionUser) {
  const students = await fetchApiJson<Student[]>(session, "/api/v1/students", {
    errorMessage: "Nao foi possivel carregar os alunos."
  });

  return students.sort((left, right) => left.fullName.localeCompare(right.fullName, "pt-BR"));
}

export async function searchStudents(
  session: SessionUser,
  params: {
    q?: string;
    page?: number;
    size?: number;
  }
) {
  const searchParams = new URLSearchParams();
  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
  }
  searchParams.set("page", String(Math.max(params.page ?? 0, 0)));
  searchParams.set("size", String(Math.max(params.size ?? 20, 1)));

  return fetchApiJson<StudentSearchResult>(session, `/api/v1/students/search?${searchParams.toString()}`, {
    errorMessage: "Nao foi possivel pesquisar os alunos."
  });
}

export async function fetchStudentById(session: SessionUser, studentId: string) {
  return fetchApiJson<Student>(session, `/api/v1/students/${studentId}`, {
    errorMessage: "Nao foi possivel carregar o aluno selecionado."
  });
}

export type UpdateStudentPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  birthDate: string | null;
  status: StudentStatus;
};

export async function updateStudent(session: SessionUser, studentId: string, payload: UpdateStudentPayload) {
  return fetchApiJson<Student>(session, `/api/v1/students/${studentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    errorMessage: "Nao foi possivel atualizar os dados do aluno."
  });
}

