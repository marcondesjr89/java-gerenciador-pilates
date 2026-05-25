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
  SignaturePad: ({ name }: { name: string }) => (
    <input type="hidden" name={name} value="data:image/png;base64,signature" readOnly />
  )
}));

describe("LegalAcceptanceForm", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it("atualiza o modelo juridico ao trocar o tipo do termo", () => {
    render(<LegalAcceptanceForm studentId="student-1" studentName="Aluno Teste" />);

    fireEvent.click(screen.getByText("Comunicacao por WhatsApp"));
    fireEvent.click(screen.getByText("Tratamento de dados LGPD"));

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

  it("consolida o texto exibido ao aluno ao marcar mais de um termo", () => {
    render(<LegalAcceptanceForm studentId="student-1" studentName="Aluno Teste" />);

    fireEvent.click(screen.getByText("Comunicacao por WhatsApp"));

    expect(screen.getByLabelText("Titulo do documento")).toHaveValue(
      "Termo consolidado de consentimentos e autorizacoes do aluno"
    );
    expect(screen.getByText("Coleta consolidada com 2 termos")).toBeInTheDocument();
    expect(screen.getAllByText(/Natureza juridica:/)).toHaveLength(2);
    const termBody = (screen.getByLabelText("Texto exibido ao aluno") as HTMLTextAreaElement).value;
    expect(termBody).toContain("Declaro que li, compreendi e concordo");
    expect(termBody).toContain("O metodo de coleta registrado neste fluxo funciona como evidencia operacional");
    expect(termBody).toContain("1. Termo de consentimento para tratamento de dados pessoais");
    expect(termBody).toContain("Natureza juridica: Consentimento para tratamento de dados pessoais e sensiveis.");
    expect(termBody).toContain("2. Termo de consentimento para comunicacao por WhatsApp");
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

  it("carrega o modelo especifico para imagem de evolucao", () => {
    render(<LegalAcceptanceForm studentId="student-1" studentName="Aluno Teste" />);

    fireEvent.click(screen.getByText("Imagem para evolucao clinica"));
    fireEvent.click(screen.getByText("Tratamento de dados LGPD"));

    expect(screen.getByLabelText("Titulo do documento")).toHaveValue(
      "Termo de consentimento para captura de imagem de evolucao"
    );
    expect(screen.getByLabelText("Base legal ou observacao juridica")).toHaveValue(
      "Consentimento especifico para registro de imagens e videos estritamente destinados ao acompanhamento clinico e funcional da evolucao do aluno."
    );
    expect(screen.getByLabelText("Texto exibido ao aluno")).toHaveValue(
      "Autorizo o Studio Gerenciador Pilates a capturar e armazenar imagens e videos exclusivamente para acompanhamento da minha evolucao fisica, comparacao tecnica entre sessoes, registro assistencial e alinhamento do cuidado pela equipe responsavel, sem uso para divulgacao publica ou marketing."
    );
  });
});
