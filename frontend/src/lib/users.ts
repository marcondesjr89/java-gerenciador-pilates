import { API_BASE_URL } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";

export type InstructorUser = {
  id: string;
  fullName: string;
  role: "ADMIN" | "RECEPTION" | "INSTRUCTOR";
  specialties: string[];
  active: boolean;
};

export async function fetchInstructors(session: SessionUser) {
  const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
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

  const users = (await response.json()) as InstructorUser[];

  return users
    .filter((user) => user.role === "INSTRUCTOR" && user.active)
    .sort((left, right) => left.fullName.localeCompare(right.fullName, "pt-BR"));
}
