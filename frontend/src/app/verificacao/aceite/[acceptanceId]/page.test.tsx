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
    expect(screen.getByText("Tratamento de dados LGPD, Comunicacao por WhatsApp")).toBeInTheDocument();
    expect(screen.getAllByText("ACEITE-V202604-ABC12345")).toHaveLength(2);
    expect(screen.getAllByText("Documento consistente com o registro juridico.")).toHaveLength(2);
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
