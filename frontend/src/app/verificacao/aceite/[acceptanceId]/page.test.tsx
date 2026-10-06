import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LegalAcceptanceVerificationPage from "@/app/verificacao/aceite/[acceptanceId]/page";

const fetchStudentLegalAcceptanceVerificationMock = vi.fn();

vi.mock("@/lib/legal-acceptances", () => ({
  fetchStudentLegalAcceptanceVerification: (...args: unknown[]) => fetchStudentLegalAcceptanceVerificationMock(...args)
}));

describe("LegalAcceptanceVerificationPage", () => {
  beforeEach(() => {
    fetchStudentLegalAcceptanceVerificationMock.mockReset();
  });

  it("exibe aviso quando o link chega sem codigo", async () => {
    render(
      await LegalAcceptanceVerificationPage({
        params: Promise.resolve({ acceptanceId: "acceptance-1" }),
        searchParams: Promise.resolve({})
      })
    );

    expect(screen.getByText("Link incompleto")).toBeInTheDocument();
    expect(screen.getByText("O QR Code informado nao contem os dados minimos para validar o aceite.")).toBeInTheDocument();
  });

  it("renderiza a verificacao publica com os novos metadados", async () => {
    fetchStudentLegalAcceptanceVerificationMock.mockResolvedValue({
      acceptanceId: "acceptance-1",
      studentId: "student-1",
      studentName: "Laura Documento",
      studentCpfMasked: "***.123.123-**",
      issuerName: "Studio Pilates Exemplo Ltda",
      issuerDocument: "12.345.678/0001-99",
      termType: "LGPD_DATA_PROCESSING",
      coveredTermTypes: ["LGPD_DATA_PROCESSING", "WHATSAPP_COMMUNICATION"],
      title: "Termo de tratamento de dados",
      termsVersion: "v2026.04",
      legalBasis: "Consentimento",
      documentHash: "hash-123",
      status: "ACCEPTED",
      collectionMethod: "TABLET_SIGNATURE",
      acceptedAt: "2026-04-16T10:00:00Z",
      createdAt: "2026-04-16T09:50:00Z",
      capturedByUserName: "Administrador Teste",
      verificationCode: "ABCDEF1234567890",
      documentReference: "ACEITE-V202604-ABC12345",
      verificationStatement: "Documento consistente com o registro juridico.",
      verified: true
    });

    render(
      await LegalAcceptanceVerificationPage({
        params: Promise.resolve({ acceptanceId: "acceptance-1" }),
        searchParams: Promise.resolve({ code: "ABCDEF1234567890" })
      })
    );

    expect(fetchStudentLegalAcceptanceVerificationMock).toHaveBeenCalledWith("acceptance-1", "ABCDEF1234567890");
    expect(screen.getByText("Registro verificado")).toBeInTheDocument();
    expect(screen.getByText("Studio Pilates Exemplo Ltda")).toBeInTheDocument();
    expect(screen.getByText("12.345.678/0001-99")).toBeInTheDocument();
    expect(screen.getByText("Aceite consolidado em coleta unica")).toBeInTheDocument();
    expect(screen.getByText("Tratamento de dados LGPD, Comunicacao por WhatsApp")).toBeInTheDocument();
    expect(screen.getByText(/Esta validacao cobre, em um unico documento/)).toBeInTheDocument();
    expect(screen.getAllByText("ACEITE-V202604-ABC12345")).toHaveLength(2);
    expect(screen.getAllByText("Documento consistente com o registro juridico.")).toHaveLength(2);
    expect(screen.getByText("Simples (Registro Eletronico)")).toBeInTheDocument();
  });

  it("renderiza a verificacao publica com assinatura qualificada ICP-Brasil e dados do certificado", async () => {
    fetchStudentLegalAcceptanceVerificationMock.mockResolvedValue({
      acceptanceId: "acceptance-2",
      studentId: "student-2",
      studentName: "Carlos Assinatura Digital",
      studentCpfMasked: "***.554.433-**",
      issuerName: "Studio Pilates Exemplo Ltda",
      issuerDocument: "12.345.678/0001-99",
      termType: "LGPD_DATA_PROCESSING",
      coveredTermTypes: ["LGPD_DATA_PROCESSING"],
      title: "Termo com Certificacao Digital ICP-Brasil",
      termsVersion: "v2026.04-icp",
      legalBasis: "Lei Federal 14.063/2020",
      documentHash: "hash-icp-456",
      status: "ACCEPTED",
      collectionMethod: "TABLET_SIGNATURE",
      acceptedAt: "2026-04-16T11:00:00Z",
      createdAt: "2026-04-16T10:55:00Z",
      capturedByUserName: "Recepcao Teste",
      verificationCode: "ICP1234567890ABC",
      documentReference: "ACEITE-V202604ICP-12345678",
      verificationStatement: "Documento com certificado digital valido.",
      verified: true,
      digitalSignaturePresent: true,
      digitalSignatureType: "QUALIFIED",
      certificateIssuer: "AC Instituto Nacional de Tecnologia da Informacao ICP-Brasil",
      certificateSubject: "CN=Studio Pilates Exemplo Certificadora",
      certificateSerialNumber: "1A2B3C4D",
      legalFramework: "Lei Federal nº 14.063/2020, Art. 4º, III e MP nº 2.200-2/2001 (ICP-Brasil)"
    });

    render(
      await LegalAcceptanceVerificationPage({
        params: Promise.resolve({ acceptanceId: "acceptance-2" }),
        searchParams: Promise.resolve({ code: "ICP1234567890ABC" })
      })
    );

    expect(screen.getByText("Qualificada (ICP-Brasil)")).toBeInTheDocument();
    expect(screen.getByText("CN=Studio Pilates Exemplo Certificadora")).toBeInTheDocument();
    expect(screen.getByText("AC Instituto Nacional de Tecnologia da Informacao ICP-Brasil")).toBeInTheDocument();
    expect(screen.getByText("1A2B3C4D")).toBeInTheDocument();
    expect(screen.getByText("Assinado com chave criptografica")).toBeInTheDocument();
  });

  it("exibe estado de falha quando a verificacao publica cai", async () => {
    fetchStudentLegalAcceptanceVerificationMock.mockRejectedValue(new Error("offline"));

    render(
      await LegalAcceptanceVerificationPage({
        params: Promise.resolve({ acceptanceId: "acceptance-1" }),
        searchParams: Promise.resolve({ code: "ABCDEF1234567890" })
      })
    );

    expect(screen.getByText("Nao foi possivel validar o aceite")).toBeInTheDocument();
  });
});
