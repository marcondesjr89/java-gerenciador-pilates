import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FinanceStudentList } from "@/app/financeiro/finance-student-list";
import type { Student } from "@/lib/students";

const mockStudents: Student[] = [
  {
    id: "std-1",
    fullName: "Ana Beatriz",
    email: "ana@exemplo.com",
    cpf: "111.111.111-11",
    phoneNumber: "(11) 99999-0001",
    status: "ACTIVE",
    birthDate: "1990-01-01",
    lgpdConsent: true,
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    id: "std-2",
    fullName: "Bruno Silva",
    email: "bruno@exemplo.com",
    cpf: "222.222.222-22",
    phoneNumber: "(11) 99999-0002",
    status: "ACTIVE",
    birthDate: "1988-05-12",
    lgpdConsent: true,
    createdAt: "2026-01-01T00:00:00Z"
  }
];

describe("FinanceStudentList", () => {
  it("renderiza lista com contador e permite busca instantânea", () => {
    render(
      <FinanceStudentList
        students={mockStudents}
        selectedStudentId={null}
        startDate="2026-10-01"
        endDate="2026-10-31"
      />
    );

    expect(screen.getByText("Ana Beatriz")).toBeInTheDocument();
    expect(screen.getByText("Bruno Silva")).toBeInTheDocument();
    expect(screen.getByText("Exibindo 2 de 2 aluno(s)")).toBeInTheDocument();

    const searchInput = screen.getByLabelText("Buscar aluno no financeiro");
    fireEvent.change(searchInput, { target: { value: "Ana" } });

    expect(screen.getByText("Ana Beatriz")).toBeInTheDocument();
    expect(screen.queryByText("Bruno Silva")).not.toBeInTheDocument();
    expect(screen.getByText("Exibindo 1 de 2 aluno(s)")).toBeInTheDocument();
  });
});
