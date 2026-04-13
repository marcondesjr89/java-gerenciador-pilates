import { NextResponse } from "next/server";
import { proxyFormDataToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import {
  badRequest,
  hasAllowedFileType,
  isNonEmptyFile,
  readFormDataBody,
  requireRouteParam
} from "@/app/api/_lib/validation";

const CLINICAL_ATTACHMENT_CONTENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp"
] as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ studentId: string; progressEntryId: string }> }
) {
  const session = await requireInternalApiSession(["ADMIN", "INSTRUCTOR"], "Sessao invalida para anexar arquivo clinico.");

  if (session instanceof Response) {
    return session;
  }

  const { studentId, progressEntryId } = await context.params;
  const studentIdError = requireRouteParam(studentId, "Informe o aluno do anexo clinico.");

  if (studentIdError) {
    return studentIdError;
  }

  const progressEntryIdError = requireRouteParam(progressEntryId, "Informe a evolucao do anexo clinico.");

  if (progressEntryIdError) {
    return progressEntryIdError;
  }

  const formDataResult = await readFormDataBody(request);

  if (!formDataResult.success) {
    return formDataResult.response;
  }

  const formData = formDataResult.data;
  const file = formData.get("file");

  if (!isNonEmptyFile(file)) {
    return NextResponse.json({ message: "Arquivo clinico nao informado." }, { status: 400 });
  }

  if (!hasAllowedFileType(file, CLINICAL_ATTACHMENT_CONTENT_TYPES)) {
    return badRequest("Informe um PDF ou imagem valida para o anexo clinico.");
  }

  const backendFormData = new FormData();
  backendFormData.set("file", file);

  return proxyFormDataToBackend({
    session,
    path: `/api/v1/students/${studentId}/progress-entries/${progressEntryId}/attachments`,
    formData: backendFormData,
    errorMessage: "Nao foi possivel anexar o arquivo clinico."
  });
}
