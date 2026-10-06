import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudentAnonymizePanel } from "@/app/alunos/student-anonymize-panel";
import type { Student } from "@/lib/students";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

describe("StudentAnonymizePanel", () => {
  const activeStudent: Student = {
    id: "student-1",
    fullName: "Aluno Ativo Teste",
    cpf: "12345678901",
    email: "aluno@teste.com",
    phoneNumber: "85999999999",
    birthDate: "1990-01-01",
    status: "ACTIVE",
    lgpdConsent: true,
    createdAt: "2026-01-01T10:00:00Z"
  };

  const anonymizedStudent: Student = {
    ...activeStudent,
    fullName: "Titular Anonimizado #student",
    cpf: "ANON1234567",
    email: "anonimizado.student-1@studio.local",
    phoneNumber: "00000000000",
    birthDate: null,
    status: "ANONYMIZED",
    lgpdConsent: false,
    anonymizedAt: "2026-10-05T15:30:00Z",
    anonymizedReason: "Solicitacao de exclusao LGPD protocolo #999"
  };

  beforeEach(() => {
    refreshMock.mockReset();
    global.fetch = vi.fn();
  });

  it("exibe aviso de dados anonimizados quando o aluno ja possui status ANONYMIZED", () => {
    render(<StudentAnonymizePanel student={anonymizedStudent} canAnonymize={true} />);

    expect(screen.getByText("Dados pessoais anonimizados (LGPD)")).toBeInTheDocument();
    expect(screen.getByText(/Solicitacao de exclusao LGPD protocolo #999/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Anonimizar/ })).not.toBeInTheDocument();
  });

  it("exibe aviso de restricao administrativa quando usuario nao tem permissao para anonimizar", () => {
    render(<StudentAnonymizePanel student={activeStudent} canAnonymize={false} />);

    expect(screen.getByText("Anonimização restrita à administração")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Anonimizar/ })).not.toBeInTheDocument();
  });

  it("renderiza formulario acessivel com botao desabilitado ate confirmacao de ciencia", () => {
    render(<StudentAnonymizePanel student={activeStudent} canAnonymize={true} />);

    const reasonInput = screen.getByLabelText("Justificativa / Protocolo da solicitação");
    const confirmCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", { name: /Anonimizar Cadastro/ });

    expect(reasonInput).toBeInTheDocument();
    expect(confirmCheckbox).not.toBeChecked();
    expect(submitButton).toBeDisabled();

    fireEvent.click(confirmCheckbox);
    expect(confirmCheckbox).toBeChecked();
    expect(submitButton).not.toBeDisabled();
  });

  it("exibe alerta com role=alert quando backend retorna erro de obrigacoes pendentes", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message: "Nao e possivel anonimizar o aluno. Pendencias: Possui 1 reserva(s) ativa(s) na agenda"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    );

    render(<StudentAnonymizePanel student={activeStudent} canAnonymize={true} />);

    const reasonInput = screen.getByLabelText("Justificativa / Protocolo da solicitação");
    const confirmCheckbox = screen.getByRole("checkbox");
    const submitButton = screen.getByRole("button", { name: /Anonimizar Cadastro/ });

    fireEvent.change(reasonInput, { target: { value: "Exclusao LGPD" } });
    fireEvent.click(confirmCheckbox);
    fireEvent.click(submitButton);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Possui 1 reserva(s) ativa(s) na agenda");
  });
});
