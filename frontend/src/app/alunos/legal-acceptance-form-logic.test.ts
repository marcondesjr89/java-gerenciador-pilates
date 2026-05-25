import { describe, expect, it } from "vitest";
import {
  buildLegalAcceptanceDraft,
  buildLegalAcceptanceRequestPayload,
  normalizeCoveredTermTypes,
  resolveLegalAcceptanceAttachments
} from "@/app/alunos/legal-acceptance-form-logic";

describe("legal acceptance form logic", () => {
  it("normaliza o payload principal do aceite", () => {
    const formData = new FormData();
    formData.set("termType", "LGPD_DATA_PROCESSING");
    formData.append("coveredTermTypes", "LGPD_DATA_PROCESSING");
    formData.append("coveredTermTypes", "WHATSAPP_COMMUNICATION");
    formData.set("title", "  Termo LGPD  ");
    formData.set("termsVersion", " v1 ");
    formData.set("legalBasis", " ");
    formData.set("termBody", "  Corpo do termo  ");
    formData.set("status", "PENDING_SIGNATURE");
    formData.set("collectionMethod", "TABLET_SIGNATURE");
    formData.set("evidenceNote", "  Observacao.  ");

    expect(buildLegalAcceptanceRequestPayload(formData)).toEqual({
      termType: "LGPD_DATA_PROCESSING",
      coveredTermTypes: ["LGPD_DATA_PROCESSING", "WHATSAPP_COMMUNICATION"],
      title: "Termo LGPD",
      termsVersion: "v1",
      legalBasis: null,
      termBody: "Corpo do termo",
      status: "PENDING_SIGNATURE",
      collectionMethod: null,
      evidenceNote: "Observacao."
    });
  });

  it("normaliza os tipos cobertos com fallback padrao", () => {
    expect(normalizeCoveredTermTypes(["WHATSAPP_COMMUNICATION", " ", "WHATSAPP_COMMUNICATION"])).toEqual([
      "WHATSAPP_COMMUNICATION"
    ]);
    expect(normalizeCoveredTermTypes(["desconhecido"])).toEqual(["LGPD_DATA_PROCESSING"]);
  });

  it("gera um rascunho consolidado para multiplos termos", () => {
    const draft = buildLegalAcceptanceDraft(["LGPD_DATA_PROCESSING", "WHATSAPP_COMMUNICATION"]);

    expect(draft.primaryTermType).toBe("LGPD_DATA_PROCESSING");
    expect(draft.coveredTermTypes).toEqual(["LGPD_DATA_PROCESSING", "WHATSAPP_COMMUNICATION"]);
    expect(draft.title).toBe("Termo consolidado de consentimentos e autorizacoes do aluno");
    expect(draft.legalBasis).toContain("Aceite consolidado");
    expect(draft.termBody).toContain("Declaro que li, compreendi e concordo");
    expect(draft.termBody).toContain("O metodo de coleta registrado neste fluxo funciona como evidencia operacional");
    expect(draft.termBody).toContain("1. Termo de consentimento para tratamento de dados pessoais");
    expect(draft.termBody).toContain("Natureza juridica: Consentimento para tratamento de dados pessoais e sensiveis.");
    expect(draft.termBody).toContain("2. Termo de consentimento para comunicacao por WhatsApp");
    expect(draft.termBody).toContain("Natureza juridica: Consentimento para comunicacao operacional.");
  });

  it("exige assinatura em tablet quando o aceite for concluido por tablet", () => {
    const formData = new FormData();
    formData.set("status", "ACCEPTED");
    formData.set("collectionMethod", "TABLET_SIGNATURE");

    expect(resolveLegalAcceptanceAttachments(formData)).toEqual({
      errorMessage: "Colete a assinatura no tablet antes de concluir o aceite.",
      tabletSignatureDataUrl: null,
      printedTermFile: null
    });
  });

  it("retorna a assinatura em tablet quando ela estiver presente", () => {
    const formData = new FormData();
    formData.set("status", "ACCEPTED");
    formData.set("collectionMethod", "TABLET_SIGNATURE");
    formData.set("tabletSignatureDataUrl", "data:image/png;base64,signature");

    expect(resolveLegalAcceptanceAttachments(formData)).toEqual({
      errorMessage: null,
      tabletSignatureDataUrl: "data:image/png;base64,signature",
      printedTermFile: null
    });
  });

  it("exige anexo quando o aceite for em papel", () => {
    const formData = new FormData();
    formData.set("status", "ACCEPTED");
    formData.set("collectionMethod", "PRINTED_SIGNATURE");

    expect(resolveLegalAcceptanceAttachments(formData)).toEqual({
      errorMessage: "Anexe o termo assinado em papel para concluir o aceite.",
      tabletSignatureDataUrl: null,
      printedTermFile: null
    });
  });

  it("retorna o anexo quando o termo assinado em papel for enviado", () => {
    const formData = new FormData();
    const file = new File(["pdf"], "termo.pdf", { type: "application/pdf" });
    formData.set("status", "ACCEPTED");
    formData.set("collectionMethod", "PRINTED_SIGNATURE");
    formData.set("printedTermFile", file);

    expect(resolveLegalAcceptanceAttachments(formData)).toEqual({
      errorMessage: null,
      tabletSignatureDataUrl: null,
      printedTermFile: file
    });
  });
});
