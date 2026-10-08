import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudentFinancialProfile } from "@/app/financeiro/student-financial-profile";
import type { Student } from "@/lib/students";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn()
  })
}));

const mockStudent: Student = {
  id: "std-1",
  fullName: "Mariana Souza",
  email: "mariana@exemplo.com",
  cpf: "123.456.789-00",
  phoneNumber: "(11) 98888-7777",
  status: "ACTIVE",
  birthDate: "1992-04-10",
  lgpdConsent: true,
  createdAt: "2026-01-01T00:00:00Z"
};

describe("StudentFinancialProfile", () => {
  it("exibe mensagem explicativa de privacidade e LGPD quando nenhum aluno está selecionado", () => {
    render(
      <StudentFinancialProfile
        student={null}
        plans={[]}
        studentSubscriptions={[]}
        studentInvoices={[]}
      />
    );

    expect(screen.getByText("Nenhum aluno selecionado")).toBeInTheDocument();
    expect(
      screen.getByText(/Por privacidade e diretrizes da LGPD \(minimização de dados\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Privacidade por design ativa")).toBeInTheDocument();
  });

  it("renderiza a ficha financeira completa quando um aluno é explicitamente selecionado", () => {
    render(
      <StudentFinancialProfile
        student={mockStudent}
        plans={[]}
        studentSubscriptions={[]}
        studentInvoices={[]}
      />
    );

    expect(screen.getByText("Mariana Souza")).toBeInTheDocument();
    expect(screen.getByText("mariana@exemplo.com")).toBeInTheDocument();
    expect(screen.getByText("Vincular plano ao aluno")).toBeInTheDocument();
  });
});
