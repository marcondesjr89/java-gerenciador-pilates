import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudentProfile } from "@/app/alunos/student-profile";
import type { StudentLegalAcceptance } from "@/lib/legal-acceptances";
import type { Student } from "@/lib/students";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}));

vi.mock("@/app/alunos/legal-acceptance-form", () => ({
  LegalAcceptanceForm: () => <div data-testid="mock-legal-acceptance-form">Formulario Mock</div>
}));

vi.mock("@/app/alunos/portal-account-form", () => ({
  PortalAccountForm: () => <div data-testid="mock-portal-account-form">Conta Mock</div>
}));

vi.mock("@/app/alunos/student-anonymize-panel", () => ({
  StudentAnonymizePanel: () => <div data-testid="mock-anonymize-panel">Anonymize Mock</div>
}));

const mockStudent: Student = {
  id: "student-1",
  fullName: "Mariana Souza",
  cpf: "12345678901",
  birthDate: "1990-05-15",
  phone: "11988887777",
  email: "mariana@exemplo.com",
  status: "ACTIVE",
  createdAt: "2026-01-01T10:00:00Z"
};

const mockConsolidatedAcceptance: StudentLegalAcceptance = {
  id: "acceptance-1",
  studentId: "student-1",
  termType: "LGPD_DATA_PROCESSING",
  coveredTermTypes: ["LGPD_DATA_PROCESSING", "WHATSAPP_COMMUNICATION", "CLINICAL_RECORD_SHARING"],
  title: "Termo consolidado de consentimentos e autorizacoes do aluno",
  termsVersion: "v1.0-abr-2026",
  legalBasis: "Aceite consolidado para múltiplos tratamentos",
  termBody: "Declaro que li e concordo com os termos consolidados.",
  documentHash: "hashsha256abc123",
  status: "ACCEPTED",
  collectionMethod: "TABLET_SIGNATURE",
  evidenceNote: "Assinado no tablet na recepção",
  auditCollectionOrigin: "STUDENT_REGISTRATION",
  auditIpAddress: "192.168.1.100",
  auditSessionKey: "session-tech-key",
  auditUserAgent: "Mozilla/5.0 Chrome",
  capturedByUserName: "Atendente Recepcao",
  acceptedAt: "2026-04-10T14:30:00Z",
  createdAt: "2026-04-10T14:25:00Z",
  attachments: []
};

describe("StudentProfile - Seção de Termos Consolidados", () => {
  it("renderiza termo consolidado com badge de coleta unica, chips dos termos cobertos e botao acessivel de download", () => {
    render(
      <StudentProfile
        student={mockStudent}
        portalAccount={null}
        clinicalRecord={null}
        legalAcceptances={[mockConsolidatedAcceptance]}
        canViewClinicalRecord={false}
        initialTab="legal"
      />
    );

    expect(screen.getByText("Termo consolidado de consentimentos e autorizacoes do aluno")).toBeInTheDocument();
    expect(screen.getByText("Coleta consolidada (3 termos)")).toBeInTheDocument();
    expect(screen.getByText("Aceito")).toBeInTheDocument();
    expect(screen.getByText("Tablet")).toBeInTheDocument();

    expect(screen.getByText("Termos cobertos:")).toBeInTheDocument();
    expect(screen.getByText("Tratamento de dados LGPD")).toBeInTheDocument();
    expect(screen.getByText("Comunicacao por WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Compartilhamento clinico")).toBeInTheDocument();

    const downloadButton = screen.getByRole("link", {
      name: "Baixar PDF consolidado: Termo consolidado de consentimentos e autorizacoes do aluno"
    });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveAttribute(
      "href",
      "/api/students/student-1/legal-acceptances/acceptance-1/document/download"
    );
    expect(downloadButton).toHaveAttribute("target", "_blank");
  });
});
