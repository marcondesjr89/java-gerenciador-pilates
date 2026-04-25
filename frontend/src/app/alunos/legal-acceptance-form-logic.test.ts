import { describe, expect, it } from "vitest";
import {
  buildLegalAcceptanceRequestPayload,
  resolveLegalAcceptanceAttachments
} from "@/app/alunos/legal-acceptance-form-logic";

describe("legal acceptance form logic", () => {
  it("normaliza o payload principal do aceite", () => {
    const formData = new FormData();
    formData.set("termType", "LGPD_DATA_PROCESSING");
    formData.set("title", "  Termo LGPD  ");
    formData.set("termsVersion", " v1 ");
    formData.set("legalBasis", " ");
    formData.set("termBody", "  Corpo do termo  ");
    formData.set("status", "PENDING_SIGNATURE");
    formData.set("collectionMethod", "TABLET_SIGNATURE");
    formData.set("evidenceNote", "  Observacao.  ");

    expect(buildLegalAcceptanceRequestPayload(formData)).toEqual({
      termType: "LGPD_DATA_PROCESSING",
      title: "Termo LGPD",
      termsVersion: "v1",
      legalBasis: null,
      termBody: "Corpo do termo",
      status: "PENDING_SIGNATURE",
      collectionMethod: null,
      evidenceNote: "Observacao."
    });
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
