export type LegalAcceptanceRequestPayload = {
  termType: string;
  title: string;
  termsVersion: string;
  legalBasis: string | null;
  termBody: string;
  status: string;
  collectionMethod: string | null;
  evidenceNote: string;
};

export function buildLegalAcceptanceRequestPayload(formData: FormData): LegalAcceptanceRequestPayload {
  const status = String(formData.get("status") ?? "PENDING_SIGNATURE");
  const collectionMethodValue = String(formData.get("collectionMethod") ?? "").trim();
  const legalBasis = String(formData.get("legalBasis") ?? "").trim();

  return {
    termType: String(formData.get("termType") ?? "LGPD_DATA_PROCESSING"),
    title: String(formData.get("title") ?? "").trim(),
    termsVersion: String(formData.get("termsVersion") ?? "").trim(),
    legalBasis: legalBasis || null,
    termBody: String(formData.get("termBody") ?? "").trim(),
    status,
    collectionMethod: status === "ACCEPTED" ? collectionMethodValue || null : null,
    evidenceNote: String(formData.get("evidenceNote") ?? "").trim()
  };
}

export function resolveLegalAcceptanceAttachments(formData: FormData) {
  const status = String(formData.get("status") ?? "PENDING_SIGNATURE");
  const collectionMethod = String(formData.get("collectionMethod") ?? "").trim();

  if (status !== "ACCEPTED") {
    return { errorMessage: null, tabletSignatureDataUrl: null, printedTermFile: null };
  }

  if (collectionMethod === "TABLET_SIGNATURE") {
    const tabletSignatureDataUrl = String(formData.get("tabletSignatureDataUrl") ?? "").trim();
    return {
      errorMessage: tabletSignatureDataUrl ? null : "Colete a assinatura no tablet antes de concluir o aceite.",
      tabletSignatureDataUrl: tabletSignatureDataUrl || null,
      printedTermFile: null
    };
  }

  if (collectionMethod === "PRINTED_SIGNATURE") {
    const printedTermFile = formData.get("printedTermFile");
    return {
      errorMessage:
        printedTermFile instanceof File && printedTermFile.size > 0
          ? null
          : "Anexe o termo assinado em papel para concluir o aceite.",
      tabletSignatureDataUrl: null,
      printedTermFile: printedTermFile instanceof File && printedTermFile.size > 0 ? printedTermFile : null
    };
  }

  return { errorMessage: null, tabletSignatureDataUrl: null, printedTermFile: null };
}
