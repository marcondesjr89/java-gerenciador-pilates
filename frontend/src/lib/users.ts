import { API_BASE_URL } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";

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
  const response = await fetch(`${API_BASE_URL}/api/v1/users/instructors`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os instrutores.");
  }

  return (await response.json()) as InstructorUser[];
}

export async function fetchActiveStudents(session: SessionUser) {
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

  const students = (await response.json()) as StudentUser[];

  return students
    .filter((student) => student.status === "ACTIVE")
    .sort((left, right) => left.fullName.localeCompare(right.fullName, "pt-BR"));
}
