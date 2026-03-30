import { API_BASE_URL } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";

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
  const response = await fetch(`${API_BASE_URL}/api/v1/students`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os alunos.");
  }

  const students = (await response.json()) as Student[];

  return students.sort((left, right) => left.fullName.localeCompare(right.fullName, "pt-BR"));
}
