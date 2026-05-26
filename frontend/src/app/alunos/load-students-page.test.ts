import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadStudentsPage } from "@/app/alunos/load-students-page";
import type { SessionUser } from "@/lib/auth";
import type { Student, StudentSearchResult } from "@/lib/students";
import { fetchStudentById, searchStudents } from "@/lib/students";

vi.mock("@/lib/clinical", () => ({
  fetchClinicalRecord: vi.fn().mockResolvedValue(null)
}));

vi.mock("@/lib/legal-acceptances", () => ({
  fetchStudentLegalAcceptances: vi.fn().mockResolvedValue([])
}));

vi.mock("@/lib/student-portal", () => ({
  fetchStudentPortalAccount: vi.fn().mockResolvedValue(null)
}));

vi.mock("@/lib/students", () => ({
  fetchStudentById: vi.fn(),
  searchStudents: vi.fn()
}));

const session: SessionUser = {
  accessToken: "token",
  email: "admin@teste.local",
  userId: "user-1",
  fullName: "Admin Teste",
  expiresAt: Date.now() + 60_000,
  role: "ADMIN"
};

const student: Student = {
  id: "student-1",
  fullName: "Ana Busca",
  cpf: "12345678901",
  email: "ana@teste.local",
  phoneNumber: "85991111111",
  birthDate: "1991-04-10",
  status: "ACTIVE",
  lgpdConsent: true,
  createdAt: "2026-04-10T10:00:00Z"
};

function buildSearchResult(overrides: Partial<StudentSearchResult>): StudentSearchResult {
  return {
    items: [student],
    totalElements: 1,
    totalPages: 1,
    page: 0,
    size: 20,
    summary: {
      totalStudents: 1,
      activeStudents: 1,
      inactiveStudents: 0,
      lgpdStudents: 1
    },
    ...overrides
  };
}

describe("loadStudentsPage", () => {
  beforeEach(() => {
    vi.mocked(fetchStudentById).mockReset();
    vi.mocked(searchStudents).mockReset();
  });

  it("normaliza pagina invalida antes de consultar alunos", async () => {
    vi.mocked(searchStudents).mockResolvedValue(buildSearchResult({}));

    await loadStudentsPage(session, { page: "1.9", q: " Ana " });

    expect(searchStudents).toHaveBeenCalledWith(session, {
      q: "Ana",
      page: 1,
      size: 20
    });
  });

  it("refaz a busca na ultima pagina quando a pagina solicitada passa do limite", async () => {
    vi.mocked(searchStudents)
      .mockResolvedValueOnce(buildSearchResult({ items: [], totalElements: 25, totalPages: 2, page: 9 }))
      .mockResolvedValueOnce(buildSearchResult({ totalElements: 25, totalPages: 2, page: 1 }));

    const result = await loadStudentsPage(session, { page: "9" });

    expect(searchStudents).toHaveBeenNthCalledWith(1, session, {
      q: "",
      page: 9,
      size: 20
    });
    expect(searchStudents).toHaveBeenNthCalledWith(2, session, {
      q: "",
      page: 1,
      size: 20
    });
    expect(result.pagination.page).toBe(1);
    expect(result.selectedStudent?.id).toBe("student-1");
  });

  it("busca o aluno selecionado quando ele nao esta na pagina atual", async () => {
    vi.mocked(searchStudents).mockResolvedValue(buildSearchResult({ items: [] }));
    vi.mocked(fetchStudentById).mockResolvedValue(student);

    const result = await loadStudentsPage(session, { studentId: "student-1" });

    expect(fetchStudentById).toHaveBeenCalledWith(session, "student-1");
    expect(result.selectedStudent?.id).toBe("student-1");
  });
});
