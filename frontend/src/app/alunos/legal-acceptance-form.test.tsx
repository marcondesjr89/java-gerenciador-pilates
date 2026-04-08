import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LegalAcceptanceForm } from "@/app/alunos/legal-acceptance-form";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

vi.mock("@/app/alunos/signature-pad", () => ({
  SignaturePad: ({ name }: { name: string }) => <input type="hidden" name={name} value="" readOnly />
}));

describe("LegalAcceptanceForm", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it("atualiza o modelo juridico ao trocar o tipo do termo", () => {
    render(<LegalAcceptanceForm studentId="student-1" studentName="Aluno Teste" />);

    fireEvent.change(screen.getByLabelText("Tipo do termo"), {
      target: { value: "WHATSAPP_COMMUNICATION" }
    });

    expect(screen.getByLabelText("Titulo do documento")).toHaveValue(
      "Termo de consentimento para comunicacao por WhatsApp"
    );
    expect(screen.getByLabelText("Versao do termo")).toHaveValue("v1.0-abr-2026");
    expect(screen.getByLabelText("Base legal ou observacao juridica")).toHaveValue(
      "Consentimento do titular para envio de comunicacoes operacionais e lembretes por WhatsApp."
    );
    expect(String(screen.getByLabelText("Texto exibido ao aluno").getAttribute("value") ?? "")).toBe("");
    expect(screen.getByLabelText("Texto exibido ao aluno")).toHaveValue(
      "Autorizo o Studio Gerenciador Pilates a utilizar meu numero de telefone para envio de avisos de agenda, confirmacoes, remarcacoes, pendencias financeiras e comunicacoes operacionais por WhatsApp."
    );
  });

  it("exibe upload do termo em papel quando o metodo de coleta muda", () => {
    render(<LegalAcceptanceForm studentId="student-1" studentName="Aluno Teste" />);

    fireEvent.change(screen.getByLabelText("Status inicial"), {
      target: { value: "ACCEPTED" }
    });
    fireEvent.change(screen.getByLabelText("Metodo de coleta"), {
      target: { value: "PRINTED_SIGNATURE" }
    });

    expect(screen.getByText("Termo assinado em papel")).toBeInTheDocument();
    expect(screen.getByText("Envie PDF ou imagem do termo fisico assinado.")).toBeInTheDocument();
  });
});
