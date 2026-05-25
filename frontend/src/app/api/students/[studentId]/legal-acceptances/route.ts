import { proxyFormDataToBackend, proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import {
  badRequest,
  hasAllowedFileType,
  isNonEmptyFile,
  isOneOf,
  readFormDataBody,
  readJsonBody,
  readTrimmedString,
  requireRouteParam
} from "@/app/api/_lib/validation";

const LEGAL_TERM_TYPES = [
  "LGPD_DATA_PROCESSING",
  "WHATSAPP_COMMUNICATION",
  "CLINICAL_RECORD_SHARING",
  "EVOLUTION_IMAGE_CAPTURE"
] as const;
const LEGAL_STATUSES = ["PENDING_SIGNATURE", "ACCEPTED"] as const;
const COLLECTION_METHODS = ["TABLET_SIGNATURE", "PRINTED_SIGNATURE", "INTERNAL_RECORD"] as const;
const IMAGE_CONTENT_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const DOCUMENT_CONTENT_TYPES = ["application/pdf", ...IMAGE_CONTENT_TYPES] as const;

type LegalAcceptancePayload = {
  termType?: unknown;
  coveredTermTypes?: unknown;
  title?: unknown;
  termsVersion?: unknown;
  legalBasis?: unknown;
  termBody?: unknown;
  status?: unknown;
  collectionMethod?: unknown;
  evidenceNote?: unknown;
};

function buildLegalAcceptanceAuditHeaders(request: Request) {
  const userAgent = request.headers.get("user-agent")?.trim() ?? "";
  const forwardedFor = request.headers.get("x-forwarded-for")?.trim() ?? "";
  const realIp = request.headers.get("x-real-ip")?.trim() ?? "";
  const normalizedUserAgent = userAgent.toLowerCase();
  const collectionOrigin = normalizedUserAgent.includes("ipad") || normalizedUserAgent.includes("tablet")
    ? "internal-web-tablet"
    : normalizedUserAgent.includes("mobi") || normalizedUserAgent.includes("android")
      ? "internal-web-mobile"
      : "internal-web-desktop";

  return {
    ...(userAgent ? { "X-GP-Client-User-Agent": userAgent } : {}),
    ...(forwardedFor ? { "X-Forwarded-For": forwardedFor } : {}),
    ...(realIp ? { "X-Real-IP": realIp } : {}),
    "X-GP-Collection-Origin": collectionOrigin
  };
}

function validateLegalAcceptancePayload(body: LegalAcceptancePayload) {
  const termType = readTrimmedString(body.termType);
  const coveredTermTypes = Array.isArray(body.coveredTermTypes)
    ? body.coveredTermTypes.map((value) => readTrimmedString(value)).filter((value) => value.length > 0)
    : [];
  const title = readTrimmedString(body.title);
  const termsVersion = readTrimmedString(body.termsVersion);
  const legalBasis = readTrimmedString(body.legalBasis);
  const termBody = readTrimmedString(body.termBody);
  const status = readTrimmedString(body.status);
  const rawCollectionMethod = readTrimmedString(body.collectionMethod);
  const evidenceNote = readTrimmedString(body.evidenceNote);

  if (!isOneOf(termType, LEGAL_TERM_TYPES)) {
    return { response: badRequest("Informe um tipo de termo valido.") };
  }

  if (coveredTermTypes.some((value) => !isOneOf(value, LEGAL_TERM_TYPES))) {
    return { response: badRequest("Informe apenas tipos validos na consolidacao do termo.") };
  }

  if (!title || title.length > 255) {
    return { response: badRequest("Informe um titulo valido com ate 255 caracteres.") };
  }

  if (!termsVersion || termsVersion.length > 60) {
    return { response: badRequest("Informe uma versao valida com ate 60 caracteres.") };
  }

  if (legalBasis.length > 255) {
    return { response: badRequest("Informe uma base legal com ate 255 caracteres.") };
  }

  if (!termBody) {
    return { response: badRequest("Informe o texto do termo.") };
  }

  if (!isOneOf(status, LEGAL_STATUSES)) {
    return { response: badRequest("Informe um status valido para o termo.") };
  }

  if (evidenceNote.length > 1000) {
    return { response: badRequest("Informe uma evidencia operacional com ate 1000 caracteres.") };
  }

  if (status === "ACCEPTED") {
    if (!isOneOf(rawCollectionMethod, COLLECTION_METHODS)) {
      return { response: badRequest("Informe um metodo de coleta valido para o termo aceito.") };
    }
  } else if (rawCollectionMethod) {
    return { response: badRequest("Nao informe metodo de coleta para termo pendente.") };
  }

  return {
    data: {
      termType,
      coveredTermTypes: coveredTermTypes.length > 0 ? Array.from(new Set(coveredTermTypes)) : [termType],
      title,
      termsVersion,
      legalBasis: legalBasis || null,
      termBody,
      status,
      collectionMethod: status === "ACCEPTED" ? rawCollectionMethod : null,
      evidenceNote: evidenceNote || null
    }
  };
}

export async function POST(request: Request, context: { params: Promise<{ studentId: string }> }) {
  const session = await requireInternalApiSession(
    ["ADMIN", "RECEPTION", "INSTRUCTOR"],
    "Sessao invalida para registrar termo legal."
  );

  if (session instanceof Response) {
    return session;
  }

  const { studentId } = await context.params;
  const studentIdError = requireRouteParam(studentId, "Informe o aluno do termo legal.");
  const auditHeaders = buildLegalAcceptanceAuditHeaders(request);

  if (studentIdError) {
    return studentIdError;
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formDataResult = await readFormDataBody(request);

    if (!formDataResult.success) {
      return formDataResult.response;
    }

    const formData = formDataResult.data;
    const requestPart = formData.get("request");

    if (!(requestPart instanceof Blob)) {
      return badRequest("Informe o payload do termo legal.");
    }

    let parsedRequest: LegalAcceptancePayload;
    try {
      parsedRequest = JSON.parse(await requestPart.text()) as LegalAcceptancePayload;
    } catch {
      return badRequest("Payload do termo legal invalido.");
    }

    const validatedPayload = validateLegalAcceptancePayload(parsedRequest);

    if ("response" in validatedPayload) {
      return validatedPayload.response;
    }

    const tabletSignatureFile = formData.get("tabletSignatureFile");
    const printedTermFile = formData.get("printedTermFile");

    if (
      validatedPayload.data.status === "ACCEPTED" &&
      validatedPayload.data.collectionMethod === "TABLET_SIGNATURE"
    ) {
      if (!isNonEmptyFile(tabletSignatureFile)) {
        return badRequest("Assinatura no tablet obrigatoria para concluir o aceite.");
      }

      if (!hasAllowedFileType(tabletSignatureFile, IMAGE_CONTENT_TYPES)) {
        return badRequest("Informe uma imagem valida para a assinatura no tablet.");
      }
    }

    if (
      validatedPayload.data.status === "ACCEPTED" &&
      validatedPayload.data.collectionMethod === "PRINTED_SIGNATURE"
    ) {
      if (!isNonEmptyFile(printedTermFile)) {
        return badRequest("Anexe o termo assinado em papel para concluir o aceite.");
      }

      if (!hasAllowedFileType(printedTermFile, DOCUMENT_CONTENT_TYPES)) {
        return badRequest("Informe um PDF ou imagem valida para o termo assinado.");
      }
    }

    const backendFormData = new FormData();
    backendFormData.set("request", new Blob([JSON.stringify(validatedPayload.data)], { type: "application/json" }));

    if (isNonEmptyFile(tabletSignatureFile)) {
      backendFormData.set("tabletSignatureFile", tabletSignatureFile);
    }

    if (isNonEmptyFile(printedTermFile)) {
      backendFormData.set("printedTermFile", printedTermFile);
    }

    return proxyFormDataToBackend({
      session,
      path: `/api/v1/students/${studentId}/legal-acceptances`,
      formData: backendFormData,
      extraHeaders: auditHeaders,
      errorMessage: "Nao foi possivel registrar o termo legal."
    });
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const validatedPayload = validateLegalAcceptancePayload(bodyResult.data as LegalAcceptancePayload);

  if ("response" in validatedPayload) {
    return validatedPayload.response;
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/students/${studentId}/legal-acceptances`,
    method: "POST",
    body: validatedPayload.data,
    extraHeaders: auditHeaders,
    errorMessage: "Nao foi possivel registrar o termo legal."
  });
}
