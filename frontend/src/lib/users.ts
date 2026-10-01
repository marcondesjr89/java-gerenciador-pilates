import type { SessionUser } from "@/lib/auth";
import { fetchApiJson } from "@/lib/http";
import type { StudentSummary } from "@/lib/students";

export type UserRole = "ADMIN" | "RECEPTION" | "INSTRUCTOR";

export type InstructorSpecialty =
  | "PILATES_SOLO"
  | "PILATES_APARELHOS"
  | "PILATES_GESTANTES"
  | "PILATES_REABILITACAO"
  | "PILATES_IDOSOS";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  RECEPTION: "Recepção",
  INSTRUCTOR: "Instrutor"
};

export const INSTRUCTOR_SPECIALTY_LABELS: Record<InstructorSpecialty, string> = {
  PILATES_SOLO: "Solo",
  PILATES_APARELHOS: "Aparelhos",
  PILATES_GESTANTES: "Gestantes",
  PILATES_REABILITACAO: "Reabilitação",
  PILATES_IDOSOS: "Idosos"
};

export type InstructorUser = {
  id: string;
  fullName: string;
  specialties: string[];
};

export type StudentUser = StudentSummary;

export type InternalUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  specialties: InstructorSpecialty[];
  active: boolean;
  createdAt: string;
};

export type CreateUserPayload = {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
  specialties?: InstructorSpecialty[];
};

export type UpdateUserPayload = {
  fullName: string;
  role: UserRole;
  specialties?: InstructorSpecialty[];
};

export type UpdateUserStatusPayload = {
  active: boolean;
};

export type ChangeUserPasswordPayload = {
  newPassword: string;
};

export async function fetchInstructors(session: SessionUser) {
  return fetchApiJson<InstructorUser[]>(session, "/api/v1/users/instructors", {
    errorMessage: "Nao foi possivel carregar os instrutores."
  });
}

export async function fetchInternalUsers(session: SessionUser) {
  return fetchApiJson<InternalUser[]>(session, "/api/v1/users", {
    errorMessage: "Nao foi possivel carregar os usuarios da equipe."
  });
}

export async function fetchActiveStudents(session: SessionUser) {
  const students = await fetchApiJson<StudentSummary[]>(session, "/api/v1/students", {
    errorMessage: "Nao foi possivel carregar os alunos."
  });

  return students
    .filter((student) => student.status === "ACTIVE")
    .sort((left, right) => left.fullName.localeCompare(right.fullName, "pt-BR"));
}
