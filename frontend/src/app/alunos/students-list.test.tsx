import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudentsList } from "@/app/alunos/students-list";
import type { Student } from "@/lib/students";

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

describe("StudentsList", () => {
  it("mostra total da busca e preserva filtro na paginacao", () => {
    render(
      <StudentsList
        students={[student]}
        selectedStudentId="student-1"
        searchTerm="Ana Busca"
        currentPage={1}
        totalElements={21}
        totalPages={3}
      />
    );

    expect(screen.getByText("Exibindo 1 de 21 alunos encontrados.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pagina anterior" })).toHaveAttribute(
      "href",
      "/alunos?q=Ana%20Busca&page=0"
    );
    expect(screen.getByRole("link", { name: "Proxima pagina" })).toHaveAttribute(
      "href",
      "/alunos?q=Ana%20Busca&page=2"
    );
  });
});
